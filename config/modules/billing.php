<?php

return [
    /*
     * Enable or disable the billing module.
     */
    'enabled' => env('BILLING_ENABLED', false),

    /*
     * Configure the publishable & secret API key for Stripe.
     */
    'keys' => [
        'publishable' => env('BILLING_PUBLISHABLE_KEY', ''),
        'secret' => env('BILLING_SECRET_KEY', ''),
    ],

    /*
     * Choose whether to add PayPal integration to the Panel.
     */
    'paypal' => env('BILLING_PAYPAL', false),

    /*
     * Choose whether to add Link integration to the Panel.
     */
    'link' => env('BILLING_LINK', false),

    /*
     * Set a currency code and symbol to use for billing.
     */
    'currency' => [
        'symbol' => '$',
        'code' => 'usd',
    ],

    /*
     * Configure URLs for legal documentation.
     */
    'links' => [
        'terms' => '',
        'privacy' => '',
    ],

    /*
     * Configure renewal and suspension settings.
     */
    'renewal' => [
        'days' => env('BILLING_RENEWAL_DAYS', 30),
        'free_renewal_days' => env('BILLING_FREE_RENEWAL_DAYS', 30),
        'suspension_threshold' => env('BILLING_SUSPENSION_THRESHOLD', 7),
        'free_suspension_days' => env('BILLING_FREE_SUSPENSION_DAYS', 7),
        'paid_suspension_days' => env('BILLING_PAID_SUSPENSION_DAYS', 30),
    ],
];
