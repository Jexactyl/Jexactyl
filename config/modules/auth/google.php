<?php

return [
    /*
     * Enable or disable registration
     */
    'enabled' => env('GOOGLE_ENABLED', false),

    /*
     * Google Client ID
     */
    'client_id' => env('GOOGLE_CLIENT_ID', ''),

    /*
     * Discord Client ID
     */
    'client_secret' => env('GOOGLE_CLIENT_SECRET', ''),
];
