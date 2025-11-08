<?php

namespace Everest\Transformers\Api\Application;

use Everest\Transformers\Api\Transformer;
use Everest\Models\Billing\BillingException;

class BillingExceptionTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return 'billing_exceptions';
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(BillingException $model): array
    {
        return [
            'id' => $model->id,
            'uuid' => $model->uuid,
            'title' => $model->title,
            'description' => $model->description,
            'exception_type' => $model->exception_type,
            'order_id' => $model->order_id ?? null,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String() ? $model->updated_at->toIso8601String() : null,
        ];
    }
}
