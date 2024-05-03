<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Laravel\Cashier\Cashier;
use Everest\Models\Billing\Product;
use Illuminate\Http\RedirectResponse;
use Everest\Services\Billing\CreateServerService;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class OrderController extends ClientApiController
{
    public function __construct(private CreateServerService $serverCreation)
    {
        parent::__construct();
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
                    'node_id' => $request->input('node'),
                    'user_id' => $request->user()->id,
                    'product_id' => $product->id,
                    'username' => $request->user()->username,
                    'environment' => json_encode($request->input('data')),
                ]
            ])
            ->url;

        return $session;
    }

    /**
     * Process a successful subscription purchase.
     */
    public function success(Request $request): RedirectResponse
    {
        $id = $request->get('session_id');

        $session = Cashier::stripe()->checkout->sessions->retrieve($id);

        if (!$session || $session->payment_status !== 'paid') {
            return redirect('/billing/cancel');
        };

        $product = Product::findOrFail($session['metadata']['product_id']);

        $server = $this->serverCreation->process($request, $product, $session['metadata']);

        return redirect('/billing/success');
    }

    /**
     * Process a cancelled subscription purchase.
     */
    public function cancel(): RedirectResponse
    {
        return redirect('/billing/cancel');
    }
}
