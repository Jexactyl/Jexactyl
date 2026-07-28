<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\Ticket;
use Illuminate\Http\Request;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Models\TicketMessage;
use Everest\Exceptions\DisplayException;
use Everest\Http\Requests\Api\Client\ClientApiRequest;
use Everest\Transformers\Api\Client\TicketTransformer;
use Everest\Http\Requests\Api\Client\Account\StoreTicketRequest;
use Everest\Http\Requests\Api\Client\Account\AddTicketMessageRequest;

class TicketController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the tickets that have been configured for the logged-in
     * user account.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->transform($request->user()->tickets, TicketTransformer::class);
    }

    /**
     * Stores a new Ticket for the authenticated user's account.
     */
    public function store(StoreTicketRequest $request): array
    {
        $enabled = config('modules.tickets.enabled');
        $max_count = (int) config('modules.tickets.max_count');

        if (!boolval($enabled)) {
            throw new DisplayException('You cannot create a ticket as the module is disabled.');
        }

        if ($request->user()->tickets()->count() >= $max_count) {
            throw new DisplayException("You have reached the ticket count per user of {$max_count}.");
        }

        $ticket = $request->user()->tickets()->create([
            'title' => $request->input('title'),
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->input('message'),
        ]);

        Activity::event('user:ticket.create')
            ->subject($ticket)
            ->log();

        return $this->transform($ticket, TicketTransformer::class);
    }

    /**
     * View a ticket and its associated messages.
     */
    public function view(Ticket $ticket, Request $request): array
    {
        if ($request->user()->id !== $ticket->user_id) {
            throw new DisplayException('You do not own this ticket.');
        }

        return $this->transform($ticket, TicketTransformer::class);
    }

    /**
     * Add a message to a ticket.
     */
    public function message(Ticket $ticket, AddTicketMessageRequest $request): array
    {
        if ($request->user()->id !== $ticket->user_id) {
            throw new DisplayException('You do not own this ticket.');
        }

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->input('message'),
        ]);

        return $this->transform($ticket, TicketTransformer::class);
    }

    /**
     * Deletes an Ticket from the user's account.
     */
    public function delete(Ticket $ticket, ClientApiRequest $request): Response
    {
        if ($request->user()->id !== $ticket->user_id) {
            throw new DisplayException('You do not own this ticket.');
        }

        $ticket->delete();
        TicketMessage::where('ticket_id', $ticket->id)->delete();

        Activity::event('user:ticket.delete')
            ->property('identifier', $ticket->id)
            ->log();

        return $this->returnNoContent();
    }
}
