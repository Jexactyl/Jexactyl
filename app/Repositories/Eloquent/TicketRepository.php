<?php

namespace Pterodactyl\Repositories\Eloquent;

use Pterodactyl\Models\Ticket;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Pterodactyl\Contracts\Repository\TicketRepositoryInterface;

class TicketRepository extends EloquentRepository implements TicketRepositoryInterface
{
    /**
     * Return the model backing this repository.
     *
     * @throws ModelNotFoundException
     */
    public function model(): string
    {
        return Ticket::class;
    }
}
