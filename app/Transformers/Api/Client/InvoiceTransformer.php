<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Billing\Invoice;
use Everest\Transformers\Api\Transformer;

class InvoiceTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Invoice::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client. The
     * PDF itself is never embedded here — it's fetched separately via the download route.
     */
    public function transform(Invoice $model): array
    {
        return [
            'id' => $model->id,
            'number' => $model->number,
            'generated_at' => $model->generated_at?->toIso8601String(),
        ];
    }
}
