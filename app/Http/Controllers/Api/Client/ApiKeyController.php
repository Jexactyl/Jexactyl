<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\ApiKey;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Everest\Exceptions\DisplayException;
use Everest\Http\Requests\Api\Client\ClientApiRequest;
use Everest\Transformers\Api\Client\ApiKeyTransformer;
use Everest\Http\Requests\Api\Client\Account\StoreApiKeyRequest;

class ApiKeyController extends ClientApiController
{
    /**
     * Returns all the API keys that exist for the given client.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->transform($request->user()->apiKeys, ApiKeyTransformer::class);
    }

    /**
     * Store a new API key for a user's account.
     *
     * @throws DisplayException
     */
    public function store(StoreApiKeyRequest $request): array
    {
        $token = DB::transaction(function () use ($request) {
            if ($request->user()->apiKeys()->lockForUpdate()->count() >= 25) {
                throw new DisplayException('You have reached the account limit for number of API keys.');
            }

            return $request->user()->createToken(
                $request->input('description'),
                $request->input('allowed_ips')
            );
        });

        Activity::event('user:api-key.create')
            ->subject($token->accessToken)
            ->property('identifier', $token->accessToken->identifier)
            ->log();

        return $this->fractal->item($token->accessToken)
            ->transformWith(ApiKeyTransformer::class)
            ->addMeta(['secret_token' => $token->plainTextToken])
            ->toArray();
    }

    /**
     * Deletes a given API key.
     */
    public function delete(ClientApiRequest $request, string $identifier): Response
    {
        /** @var ApiKey $key */
        $key = $request->user()->apiKeys()
            ->where('key_type', ApiKey::TYPE_ACCOUNT)
            ->where('identifier', $identifier)
            ->firstOrFail();

        Activity::event('user:api-key.delete')
            ->property('identifier', $key->identifier)
            ->log();

        $key->delete();

        return $this->returnNoContent();
    }
}
