<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Billing\BillingPlan;
use Everest\Transformers\Api\Transformer;

class BillingPlanTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return BillingPlan::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(BillingPlan $model): array
    {
        return [
            'id' => $model->id,
            'state' => $model->state,
            'bill_date' => $model->bill_date,
            'uuid' => $model->uuid,
            'name' => $model->name,
            'price' => $model->price,
            'description' => $model->description,
            'limits' => [
                'cpu' => $model->cpu_limit,
                'memory' => $model->memory_limit,
                'disk' => $model->disk_limit,
                'backup' => $model->backup_limit,
                'database' => $model->database_limit,
                'allocation' => $model->allocation_limit,
            ],
        ];
    }
}
