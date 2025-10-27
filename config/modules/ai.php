<?php

return [
    /*
     * Enable or disable the AI module.
     */
    'enabled' => env('AI_ENABLED', false),

    /*
     * API Key for OpenAI compatible API
     */
    'api_key' => env('AI_API_KEY', ''),

    /*
     * Endpoint URL for OpenAI compatible API
     */
    'endpoint' => env('AI_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),

    /*
     * Model to use
     */
    'model' => env('AI_MODEL', 'gpt-3.5-turbo'),

    /*
     * Maximum tokens to generate
     */
    'max_tokens' => env('AI_MAX_TOKENS', 1000),

    /*
     * Temperature for response generation (0.0 to 1.0)
     */
    'temperature' => env('AI_TEMPERATURE', 0.7),

    /*
     * Should clients be allowed to use AI features?
     */
    'user_access' => env('AI_USER_ACCESS', false),
];
