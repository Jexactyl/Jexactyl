<?php

return [
    /*
     * Enable or disable the webook module.
     */
    'enabled' => env('WEBHOOK_ENABLED', false),

    /*
     * Set the webhook URL to send data.
     */
    'url' => env('WEBHOOK_URL', ''),
];
