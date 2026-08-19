<?php

return [
    /*
     * Enable or disable the webook module.
     */
    'enabled' => (bool) env('WEBHOOK_ENABLED', false),

    /*
     * Set the webhook URL to send data.
     */
    'url' => env('WEBHOOK_URL', ''),
];
