<?php

/*
|--------------------------------------------------------------------------
| Jexactyl Gateways
|--------------------------------------------------------------------------
| This configuration file is used to determine the settings for Jexactyl's
| payment gateways (Stripe and PayPal by default).
*/

return [
    /*
    |--------------------------------------------------------------------------
    | Preferred Currency
    |--------------------------------------------------------------------------
    | This value determines what currency to process orders in.
    |
    */
    'currency' => env('STORE_CURRENCY', 'USD'),

    /*
    |--------------------------------------------------------------------------
    | Cost per 100 credits
    |--------------------------------------------------------------------------
    | 该值决定了 100 积分的成本。 默认为 1 美元。
    |
    */
    'cost' => env('STORE_COST', 1.00),

    /*
    |--------------------------------------------------------------------------
    | PayPal Configuration
    |--------------------------------------------------------------------------
    | These values determine the configuration for the PayPal purchase system.
    |
    */
    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID', ''),
        'client_secret' => env('PAYPAL_CLIENT_SECRET', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    | These values determine the configuration for the Stripe purchase system.
    |
    */
    'stripe' => [
        'secret' => env('STRIPE_CLIENT_SECRET', ''),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
    ],
];
