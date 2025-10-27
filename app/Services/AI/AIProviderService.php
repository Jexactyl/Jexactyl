<?php

namespace Everest\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIProviderService
{
    private string $apiKey;
    private string $endpoint;
    private array $config;

    public function __construct()
    {
        $this->apiKey = config('modules.ai.api_key', '');
        $this->endpoint = config('modules.ai.endpoint', 'https://api.openai.com/v1/chat/completions');
        $this->config = config('modules.ai', []);
    }

    /**
     * Send a query to the OpenAI compatible API
     */
    public function query(string $message): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('AI API key is not configured.');
        }

        $response = Http::timeout(30)->withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post($this->endpoint, [
            'model' => $this->config['model'] ?? 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $message]
            ],
            'max_tokens' => (int) ($this->config['max_tokens'] ?? 1000),
            'temperature' => (float) ($this->config['temperature'] ?? 0.7),
        ]);

        if (!$response->successful()) {
            Log::error('AI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'endpoint' => $this->endpoint
            ]);
            throw new \Exception('Failed to get response from AI API. Check your API key and endpoint.');
        }

        $data = $response->json();
        
        if (!isset($data['choices'][0]['message']['content'])) {
            Log::error('Invalid AI API response', ['response' => $data]);
            throw new \Exception('Invalid response from AI API.');
        }

        return $data['choices'][0]['message']['content'];
    }
}
