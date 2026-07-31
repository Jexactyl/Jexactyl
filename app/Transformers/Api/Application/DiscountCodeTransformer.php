<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Billing\DiscountCode;
use Everest\Transformers\Api\Transformer;

class DiscountCodeTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return DiscountCode::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(DiscountCode $model): array
    {
        return [
            'id' => $model->id,
            'code' => $model->code,
            'description' => $model->description,
            'type' => $model->type,
            'value' => $model->value,
            'uses' => $model->uses,
            'expires_at' => $model->expires_at ? $model->expires_at->toIso8601String() : null,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String(),
        ];
    }
}
