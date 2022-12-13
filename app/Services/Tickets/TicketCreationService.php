<?php

namespace Pterodactyl\Services\Store;

use Illuminate\Support\Arr;
use Pterodactyl\Models\Ticket;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Repositories\Eloquent\TicketRepository;
use Pterodactyl\Exceptions\Model\DataValidationException;

class TicketCreationService
{
    public function __construct(
        private TicketRepository $repository,
        private ConnectionInterface $connection
    ) {
    }

    /**
     * This service creates a ticket on the system and allows admins/clients to access
     * it via their respective UI interfaces.
     */
    public function handle(array $data): Ticket
    {
        $ticket = $this->connection->transaction(function () {
            $ticket = $this->createModel($data);

            return $ticket;
        }, 5);

        return $ticket;
    }

    /**
     * Store the ticket in the database and return the model.
     *
     * @throws DataValidationException
     */
    private function createModel(array $data): Ticket
    {
        /** @var Ticket $model */
        $model = $this->repository->create([
            'staff_id' => Arr::get($data, 'staff_id') ?? null,
            'client_id' => Arr::get($data, 'client_id'),
            'title' => Arr::get($data, 'title') ?? 'No title provided',
            'content' => Arr::get($data, 'content') ?? 'No content provided',
        ]);

        return $model;
    }
}
