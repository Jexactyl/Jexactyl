<?php

namespace Everest\Services\Billing;

use Everest\Models\User;
use Stripe\StripeClient;
use Everest\Models\Billing\Product;

class PaymentService
{
    /**
     * Create a new Stripe checkout and return the URL as an object.
     */
    public function create(StripeClient $stripe, User $user, Product $product, array $metadata, ?float $price = null, ?float $deploymentFee = null, bool $isBusiness = false): object
    {
        $taxCode = $isBusiness ? 'txcd_10101000' : 'txcd_10010001'; // IaaS - business / personal use
        $lineItems = [[
            'price_data' => [
                'currency' => strtolower(config('modules.billing.currency.code')),
                'product_data' => [
                    'name' => $product->name,
                    'tax_code' => $taxCode,
                ],
                'unit_amount' => (int) round(($price ?? $product->price) * 100),
            ],
            'quantity' => 1,
        ]];

        if ($deploymentFee > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower(config('modules.billing.currency.code')),
                    'product_data' => [
                        'name' => 'Deployment Fee',
                        'tax_code' => $taxCode,
                    ],
                    'unit_amount' => (int) round($deploymentFee * 100),
                ],
                'quantity' => 1,
            ];
        }

        $transaction = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'customer_email' => $user->email,
            'billing_address_collection' => 'required',
                                                           
            'line_items' => $lineItems,
            'automatic_tax' => ['enabled' => true],

            'success_url' => config('app.url') . '/account/billing/processing?session={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.url') . '/account/billing/cancel',

            'metadata' => $metadata,
        ]);

        return $transaction;
    }
}
