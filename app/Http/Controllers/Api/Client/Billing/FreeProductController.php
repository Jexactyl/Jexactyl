<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Carbon\Carbon;
use Everest\Models\Node;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Servers\SuspensionService;
use Everest\Services\Billing\CreateOrderService;
use Everest\Services\Billing\CreateServerService;
use Everest\Transformers\Api\Client\ServerTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class FreeProductController extends ClientApiController
{
    public function __construct(
        private CreateServerService $serverCreation,
        private CreateOrderService $orderService,
        private SuspensionService $suspensionService
    ) {
        parent::__construct();
    }

    /**
     * Process and validate the creation of a server
     * based off of a free product in the billing portal.
     */
    public function process(Request $request): array
    {
        $user = $request->user();
        $product = Product::with('category')->findOrFail($request->input('product'));

        if (!config('modules.billing.enabled')) {
            throw new DisplayException('The billing module is not enabled.');
        }

        if ((float) $product->price !== 0.0) {
            throw new DisplayException('This product holds a value greater than zero.');
        }

        if ($user->servers()->where('billing_product_id', $request->input('product'))->count() > 0) {
            throw new DisplayException('You already own one of this free product. Nice try!');
        }

        if (!Node::findOrFail($request->input('node'))->deployable_free) {
            throw new DisplayException('Free servers cannot be deployed to this node.');
        }

        $order = $this->orderService->create(null, $user, $product, Order::STATUS_PENDING, $this->getOrderType($request));

        if ($order->type === Order::TYPE_REN && $request->has('server_id')) {
            $server = Server::findOrFail((int) $request->input('server_id'));

            $server->update([
                'renewal_date' => $server->renewal_date->addDays(30),
                'status' => $server->isSuspended() ? null : $server->status,
            ]);
        } else {
            $variables = $request->input('variables', []);
            $server = $this->serverCreation->processFree(
                $request,
                $product,
                $request->input('node'),
                $order,
                $variables
            );
        }

        $order->update([
            'status' => Order::STATUS_PROCESSED,
            'name' => $order->name . substr($server->uuid, 0, 8),
        ]);

        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }

    /**
     * Renew a free server by extending its renewal date.
     */
    public function renew(Request $request): array
    {
        $user = $request->user();
        $serverId = $request->input('server_id');
        $product = Product::with('category')->findOrFail($request->input('product'));

        if (!config('modules.billing.enabled')) {
            throw new DisplayException('The billing module is not enabled.');
        }

        if ((float) $product->price !== 0.0) {
            throw new DisplayException('This product is not free.');
        }

        // Lookup server scoped to the authenticated user
        $server = $user->servers()->findOrFail($serverId);

        // Verify that the server uses this product
        if ($server->billing_product_id !== $product->id) {
            throw new DisplayException('This server does not use this product.');
        }

        // Create an order record for the renewal
        $order = $this->orderService->create(null, $user, $product, Order::STATUS_PENDING, Order::TYPE_REN);

        // Unsuspend the server if it was suspended due to billing
        if ($server->isSuspended()) {
            $this->suspensionService->toggle($server, SuspensionService::ACTION_UNSUSPEND);
        }

        // Reset the renewal date to configured days from now (not add days)
        $renewalDays = config('modules.billing.renewal.free_renewal_days', 30);
        $server->update([
            'renewal_date' => Carbon::now()->addDays($renewalDays)->toDateTimeString(),
        ]);

        $order->update([
            'status' => Order::STATUS_PROCESSED,
            'name' => $order->name . substr($server->uuid, 0, 8),
        ]);

        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }

    /**
     * Determine whether an order is a NEW or RENEWAL.
     */
    private function getOrderType(Request $request): string
    {
        if ($request->has('renewal') && $request->boolean('renewal')) {
            return Order::TYPE_REN;
        }

        return Order::TYPE_NEW;
    }
}
