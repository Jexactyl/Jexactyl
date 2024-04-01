<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\TicketMessage;
use Everest\Transformers\Api\Transformer;

class TicketMessageTransformer extends Transformer
{
    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return TicketMessage::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(TicketMessage $model): array
    {
        return [
            'id' => $model->id,
            'message' => $model->message,
            'author' => $model->user,
            'created_at' => $model->created_at->toAtomString(),
            'updated_at' => $model->updated_at ? $model->updated_at->toAtomString() : null,
        ];
    }
}
