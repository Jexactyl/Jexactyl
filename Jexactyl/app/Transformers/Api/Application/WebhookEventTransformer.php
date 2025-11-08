<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\WebhookEvent;
use Everest\Transformers\Api\Transformer;

class WebhookEventTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return 'webhook_event';
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(WebhookEvent $model): array
    {
        return [
            'id' => $model->id,
            'key' => $model->key,
            'description' => $model->description,
            'enabled' => $model->enabled,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String() ? $model->updated_at->toIso8601String() : null,
        ];
    }
}
