<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Egg;
use Everest\Models\Node;
use Everest\Models\User;
use Stripe\StripeClient;
use Everest\Models\Server;
use Everest\Models\Billing\Order;
use Illuminate\Support\Facades\DB;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Models\Billing\DiscountCode;
use Everest\Models\Billing\BillingException;
use Everest\Services\Billing\PaymentService;
use Everest\Services\Billing\UpgradeService;
use Everest\Services\Billing\DiscountService;
use Everest\Services\Billing\CreateOrderService;
use Everest\Services\Billing\ServerRenewalService;
use Everest\Services\Billing\ServerDeploymentService;
use Everest\Transformers\Api\Client\ServerTransformer;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Transformers\Api\Client\DiscountCodeTransformer;
use Everest\Http\Requests\Api\Client\Billing\CreateStripePaymentRequest;
use Everest\Http\Requests\Api\Client\Billing\ProcessStripePaymentRequest;
use Everest\Http\Requests\Api\Client\Billing\ValidateDiscountCodeRequest;

class StripeController extends ClientApiController
{
    private StripeClient $stripe;

    public function __construct(
        private UpgradeService $upgradeService,
        private PaymentService $paymentService,
        private DiscountService $discountService,
        private CreateOrderService $orderService,
        private ServerRenewalService $renewalService,
        private ServerDeploymentService $deploymentService,
    ) {
        parent::__construct();

        $this->stripe = app()->bound(StripeClient::class)
            ? app(StripeClient::class)
            : new StripeClient(config('modules.billing.keys.secret'));
    }

    /**
     * Create a new checkout session based on the selected information.
     */
    public function create(CreateStripePaymentRequest $request): string
    {
        $price = null;
        $server = null;
        $deploymentFee = 0.0;
        $node_id = $request->input('node_id') ?? null;
        $product = Product::findOrFail($request->input('product_id'));

        if (!$product->isPaid()) {
            throw new DisplayException('You cannot create a checkout session for a free product.');
        }

        if ($node_id) {
            $node = Node::findOrFail($node_id);

            if (!$node->deployable) {
                throw new DisplayException('Paid servers cannot be deployed to this node.');
            }

            $deploymentFee = (float) ($node->deployment_fee ?? 0);
        } else {
            try {
                $server = $request->user()->servers()
                    ->where('id', $request->input('server_id'))
                    ->firstOrFail();
            } catch (ModelNotFoundException $exception) {
                throw new DisplayException('This server ID does not exist on your account.');
            }
        }

        $order_type = $server ? Order::TYPE_RENEWAL : Order::TYPE_NEW;
        $egg_id = $this->resolveEggSelection($product, $request->input('egg_id'));

        $discountCode = $request->input('discount_code');

        if ($request->exists('discount_code')) {
            $price = $this->discountService->handle($product, $discountCode);
        }

        $metadata = [
            'user_id' => (string) $request->user()->id,
            'customer_email' => $request->user()->email,
            'product_id' => (string) $product->id,
            'node_id' => (string) ($node_id ?? ''),
            'server_id' => (string) ($server?->id ?? 0),
            'egg_id' => (string) ($egg_id ?? ''),
            'variables' => json_encode($request->input('variables') ?? []),
            'order_type' => $order_type,
            'discount_code' => $request->input('discount_code') ?? null,
        ];

        $orderMetadata = array_filter([
            'deployment_fee' => $deploymentFee > 0 ? $deploymentFee : null,
            'discount_code' => $price !== null ? $discountCode : null,
            'subtotal' => $price !== null ? $product->price : null,
        ], fn ($value) => $value !== null) ?: null;

        $transaction = $this->paymentService->create($this->stripe, $request->user(), $product, $metadata, $price, $deploymentFee);

        $order = $this->orderService->create(
            $transaction->id,
            $request->user(),
            $product,
            Order::STATUS_PENDING,
            $order_type,
            $price,
            $orderMetadata
        );

        if ($server) {
            $order->assignServer($server);
        }

        return $transaction->url;
    }

    /**
     * Retrieve the checkout session from Stripe and process the order.
     */
    public function process(ProcessStripePaymentRequest $request): array
    {
        try {
            $transaction = $this->stripe->checkout->sessions->retrieve($request->input('session'));
        } catch (DisplayException $ex) {
            throw new DisplayException('Failed to process order: unable to retrieve session');
        }

        if ($transaction->payment_status !== 'paid') {
            throw new DisplayException('Payment not completed.');
        }

        $metadata = (array) $transaction->metadata;
        $server = Server::find($metadata['server_id']);
        $user = User::findOrFail($metadata['user_id']);
        $product = Product::findOrFail($metadata['product_id']);

        // Atomically claim the order before doing any deployment work.
        $order = DB::transaction(function () use ($transaction, $metadata) {
            $order = Order::where('transaction_id', $transaction->id)->lockForUpdate()->firstOrFail();

            if ($order->status !== Order::STATUS_PENDING) {
                throw new DisplayException('This order has already been processed.');
            }

            $order->setStatus(Order::STATUS_PROCESSING);

            if (!empty($metadata['discount_code'])) {
                $discount_code = DiscountCode::where('code', $metadata['discount_code'])->lockForUpdate()->first();

                if ($discount_code && $discount_code->isValid()) {
                    $discount_code->use();
                }
            }

            return $order;
        });

        // Bind the completed payment to the order.
        $expected = (int) round($order->total * 100);
        $currency = strtolower((string) config('modules.billing.currency.code'));

        if (strtolower((string) ($transaction->currency ?? '')) !== $currency
            || (int) ($transaction->amount_total ?? 0) < $expected) {
            // Release the claim rather than failing the order outright.
            $order->setStatus(Order::STATUS_PENDING);

            throw new DisplayException('Payment amount or currency does not match the order.');
        }

        try {
            switch ($order->type) {
                case Order::TYPE_RENEWAL:
                    $server = $this->renewalService->handle($server);
                    break;
                case Order::TYPE_NEW:
                    $server = $this->deploymentService->handle($user, $product, $metadata, $order);
                    $order->assignServer($server);
                    break;
                case Order::TYPE_UPGRADE:
                    $server = $this->upgradeService->handle($server, $product);
                    break;
                default:
                    break;
            }

            $order->setStatus(Order::STATUS_PROCESSED);
        } catch (DisplayException $exception) {
            $order->setStatus(Order::STATUS_FAILED);

            BillingException::create([
                'order_id' => $order->id,
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'title' => 'Deployment or renewal of server failed',
                'description' => $exception->getMessage(),
            ]);
        }

        return $this->transform($server, ServerTransformer::class);
    }

    /**
     * Validate the discount code submitted via the customer before checkout.
     */
    public function validateDiscount(ValidateDiscountCodeRequest $request): array
    {
        $discount_code = DiscountCode::where('code', $request->input('discount_code'))->first();

        if (!$discount_code || !$discount_code->isValid()) {
            throw new DisplayException('The discount code provided is not valid.');
        }

        return $this->transform($discount_code, DiscountCodeTransformer::class);
    }

    /**
     * Validate the egg a customer selected for a product whose category doesn't pin one.
     * Categories with a fixed egg ignore any submitted selection. Returns the egg id to
     * carry through the checkout, or null when the category already has a fixed egg.
     */
    private function resolveEggSelection(Product $product, mixed $submittedEggId): ?int
    {
        if ($product->category->egg_id) {
            return null;
        }

        if (!$submittedEggId) {
            throw new DisplayException('An egg must be selected to deploy this product.');
        }

        $egg = Egg::findOrFail($submittedEggId);

        if ((int) $egg->nest_id !== (int) $product->category->nest_id) {
            throw new DisplayException('The selected egg does not belong to this product\'s nest.');
        }

        return $egg->id;
    }
}
