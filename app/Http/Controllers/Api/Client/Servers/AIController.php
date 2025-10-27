<?php

namespace Everest\Http\Controllers\Api\Client\Servers;

use Everest\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Everest\Services\AI\AIProviderService;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class AIController extends ClientApiController
{
    private AIProviderService $aiService;

    /**
     * AIController constructor.
     */
    public function __construct(AIProviderService $aiService)
    {
        parent::__construct();
        $this->aiService = $aiService;
    }

    /**
     * Send an AI generated response to debug a server error.
     */
    public function index(Request $request, Server $server): JsonResponse
    {
        if (!config('modules.ai.enabled')) {
            throw new \Exception('The Jexactyl AI module is not enabled.');
        }

        $query = $request->input('query');
        if (empty($query)) {
            throw new \Exception('Query is required.');
        }

        try {
            $response = $this->aiService->query($query);
            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
