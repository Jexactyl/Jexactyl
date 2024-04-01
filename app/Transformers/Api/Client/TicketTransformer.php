<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Ticket;
use Everest\Transformers\Api\Transformer;

class TicketTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Ticket::RESOURCE_NAME;
    }

    /**
     * Return's a user's ticket in an API response format.
     */
    public function transform(Ticket $model): array
    {
        return [
            'id' => $model->id,
            'title' => $model->title,
            'status' => $model->status,
            'created_at' => self::formatTimestamp($model->created_at),
            'updated_at' => self::formatTimestamp($model->updated_at),
        ];
    }
}
