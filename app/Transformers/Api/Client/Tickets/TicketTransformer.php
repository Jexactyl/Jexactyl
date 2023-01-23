<?php

namespace Jexactyl\Transformers\Api\Client\Tickets;

use Jexactyl\Models\User;
use Jexactyl\Models\Ticket;
use Jexactyl\Transformers\Api\Client\BaseClientTransformer;

class TicketTransformer extends BaseClientTransformer
{
    public function getResourceName(): string
    {
        return Ticket::RESOURCE_NAME;
    }

    /**
     * Transform a ticket model into a representation that can be returned
     * to a client.
     */
    public function transform(Ticket $model): array
    {
        return [
            'id' => $model->id,
            'staff_email' => User::where('id', $model->staff_id)->first()->email ?? 'system',
            'title' => $model->title,
            'status' => $model->status,
            'content' => $model->content,
            'created_at' => $model->created_at->toAtomString(),
            'updated_at' => $model->updated_at->toAtomString(),
        ];
    }
}
