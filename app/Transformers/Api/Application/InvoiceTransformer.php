<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Billing\Invoice;
use Everest\Transformers\Api\Transformer;

class InvoiceTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Invoice::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(Invoice $model): array
    {
        $order = $model->order;

        return [
            'id' => $model->id,
            'uuid' => $model->uuid,
            'number' => $model->number,
            'order_id' => $model->order_id,
            'total' => $order->total ?? $model->snapshot['total'] ?? null,
            'status' => $order->status ?? null,
            'user' => [
                'id' => $order->user->id ?? null,
                'username' => $order->user->username ?? $model->snapshot['billed_to']['username'] ?? null,
                'email' => $order->user->email ?? $model->snapshot['billed_to']['email'] ?? null,
            ],
            'generated_at' => $model->generated_at?->toIso8601String(),
            'created_at' => $model->created_at->toIso8601String(),
        ];
    }
}
