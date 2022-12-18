<?php

namespace Pterodactyl\Transformers\Api\Client\Tickets;

use Pterodactyl\Models\User;
use Pterodactyl\Models\TicketMessage;
use Pterodactyl\Transformers\Api\Client\BaseClientTransformer;

class TicketMessageTransformer extends BaseClientTransformer
{
    public function getResourceName(): string
    {
        return TicketMessage::RESOURCE_NAME;
    }

    /**
     * Transform a ticket model into a representation that can be returned
     * to a client.
     */
    public function transform(TicketMessage $model): array
    {
        return [
            'id' => $model->id,
            'user_email' => User::where('id', $model->user_id)->first()->email ?? 'Unknown User',
            'content' => $model->content,
            'created_at' => $model->created_at->toAtomString(),
            'updated_at' => $model->updated_at->toAtomString(),
        ];
    }
}
