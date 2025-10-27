<?php

namespace Everest\Http\Controllers\Api\Application;

use Everest\Models\Setting;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Services\AI\AIProviderService;
use Everest\Http\Requests\Api\Application\Intelligence;

class IntelligenceController extends ApplicationApiController
{
    private AIProviderService $aiService;

    /**
     * IntelligenceController constructor.
     */
    public function __construct(AIProviderService $aiService)
    {
        parent::__construct();
        $this->aiService = $aiService;
    }

    /**
     * Update the AI settings for the Panel.
     *
     * @throws \Throwable
     */
    public function update(Intelligence\UpdateIntelligenceSettingsRequest $request): Response
    {
        foreach ($request->normalize() as $key => $value) {
            if ($key == 'key' && is_bool($value)) {
                continue;
            }

            Setting::set('settings::modules:ai:' . $key, $value);
        }

        Activity::event('admin:ai:update')
            ->property('settings', $request->all())
            ->description('Jexactyl AI settings were updated')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Send a query to Jexactyl AI through the configured provider.
     *
     * @throws \Throwable
     */
    public function query(Intelligence\QueryRequest $request): JsonResponse
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
