<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Ramsey\Uuid\Uuid;
use Everest\Models\Egg;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Product;
use Illuminate\Http\RedirectResponse;
use Everest\Services\Billing\CreateServerService;
use Everest\Transformers\Api\Client\ProductTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class ProductController extends ClientApiController
{
    public function __construct(private CreateServerService $serverCreation)
    {
        parent::__construct();
    }

    /**
     * Returns all the products that have been configured.
     */
    public function index(int $id): array
    {
        $products = Product::where('category_id', $id)->get();

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * View a specific product.
     */
    public function view(int $id)
    {
        $product = Product::findOrFail($id);

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Order a new product.
     */
    public function order(Request $request, int $id): string
    {
        $product = Product::findOrFail($id);

        return $this->generateStripeUrl($request, $product);
    }

    /**
     * Get the Stripe Checkout URL for payment.
     */
    private function generateStripeUrl(Request $request, Product $product): string
    {
        $session = $request
            ->user()
            ->newSubscription(substr(Uuid::uuid4()->toString(), 0, 8), $product->stripe_id)
            ->checkout([
                'success_url' => route('api:client.billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('api:client.billing.cancel'),
                'metadata' => [
                    'user_id' => $request->user()->id,
                    'product_id' => $product->id,
                    'username' => $request->user()->username,
                    'environment' => json_encode($request->all()),
                ]
            ])
            ->url;

        return $session;
    }

    /**
     * Process a successful subscription purchase.
     */
    public function success(Request $request): RedirectResponse|null
    {
        $id = $request->get('session_id');

        $session = Cashier::stripe()->checkout->sessions->retrieve($id);

        if (!$session || $session->payment_status !== 'paid') {
            return redirect()->route('index');
        };

        $product = Product::findOrFail($session['metadata']['product_id']);

        $server = $this->serverCreation->process($request, $product, $session['metadata']);

        return redirect()->route('index');
    }

    /**
     * Process a cancelled subscription purchase.
     */
    public function cancel(): RedirectResponse
    {
        return redirect()->route('index');
    }
}
