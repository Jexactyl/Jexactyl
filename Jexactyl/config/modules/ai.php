<?php

return [
    /*
     * Enable or disable the AI module.
     */
    'enabled' => env('AI_ENABLED', false),

    /*
     * Set the API key for Gemini API.
     */
    'key' => env('AI_KEY', ''),

    /*
     * Should clients/users be allowed
     * to use AI features?
     */
    'user_access' => env('AI_USER_ACCESS', false),
];
