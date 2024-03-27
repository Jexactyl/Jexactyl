<?php

namespace Everest\Http\Controllers\Api\Application\Api;

use Everest\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Services\Api\KeyCreationService;
use Everest\Transformers\Api\Application\ApiKeyTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Api\StoreApplicationApiKeyRequest;

class ApiController extends ApplicationApiController
{
    /**
     * ApiController constructor.
     */
    public function __construct(
        private KeyCreationService $keyCreationService,
    )
    {
        parent::__construct();
    }

    /**
     * Return all the Admin API keys currently registered on the Panel.
     */
    public function index(Request $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $apiKeys = QueryBuilder::for(ApiKey::query())
            ->where('key_type', 2)
            ->allowedFilters(['id', 'identifier'])
            ->allowedSorts(['id', 'identifier'])
            ->paginate($perPage);

        return $this->fractal->collection($apiKeys)
            ->transformWith(ApiKeyTransformer::class)
            ->toArray();
    }

    /**
     * Create a new Admin API key for the Panel.
     */
    public function store(StoreApplicationApiKeyRequest $request): JsonResponse
    {
        $apiKey = $this->keyCreationService->setKeyType(ApiKey::TYPE_APPLICATION)->handle([
            'memo' => $request->input('memo'),
            'user_id' => $request->user()->id,
        ], $request->getKeyPermissions());

        return $this->fractal->item($apiKey)
            ->transformWith(ApiKeyTransformer::class)
            ->respond(201);
    }

    /**
     * Delete the requested API key.
     */
    public function delete(ApiKey $key): Response
    {
        ApiKey::where('id', $key->id)->delete();

        return $this->returnNoContent();
    }
}
