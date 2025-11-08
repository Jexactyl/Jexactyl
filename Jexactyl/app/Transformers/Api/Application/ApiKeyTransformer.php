<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\ApiKey;
use Everest\Transformers\Api\Transformer;

class ApiKeyTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return ApiKey::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(ApiKey $model): array
    {
        return [
            'id' => $model->id,
            'identifier' => $model->identifier,
            'description' => $model->memo,
            'allowed_ips' => $model->allowed_ips,
            'created_at' => $model->created_at->toIso8601String(),
            'last_used_at' => $model->last_used_at ? $model->last_used_at : null,
        ];
    }
}
