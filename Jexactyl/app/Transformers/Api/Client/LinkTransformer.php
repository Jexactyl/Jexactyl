<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\CustomLink;
use Everest\Transformers\Api\Transformer;

class LinkTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return CustomLink::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(CustomLink $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'url' => $model->url,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String() ? $model->updated_at->toIso8601String() : null,
        ];
    }
}
