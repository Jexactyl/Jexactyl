<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\UserPasskey;
use Everest\Transformers\Api\Transformer;

class UserPasskeyTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return UserPasskey::RESOURCE_NAME;
    }

    /**
     * Returns a user's passkey in an API response format.
     *
     * The credential itself is never exposed — only the metadata needed to list and manage it.
     */
    public function transform(UserPasskey $model): array
    {
        return [
            'uuid' => $model->uuid,
            'name' => $model->name,
            'last_used_at' => $model->last_used_at?->toIso8601String(),
            'created_at' => $model->created_at->toIso8601String(),
        ];
    }
}
