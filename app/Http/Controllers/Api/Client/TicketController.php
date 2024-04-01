<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\Ticket;
use Illuminate\Http\Request;
use Everest\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Everest\Exceptions\DisplayException;
use Everest\Http\Requests\Api\Client\ClientApiRequest;
use Everest\Transformers\Api\Client\TicketTransformer;
use Everest\Contracts\Repository\SettingsRepositoryInterface;

class TicketController extends ClientApiController
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
    )
    {
        parent::__construct();
    }

    /**
     * Returns all the tickets that have been configured for the logged-in
     * user account.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->fractal->collection($request->user()->tickets)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * Stores a new Ticket for the authenticated user's account.
     */
    public function store(Request $request): array
    {
        if (!intval($this->settings->get('settings::tickets:enabled'))) {
            throw new DisplayException('You cannot create a ticket as the module is disabled.');
        };

        $ticket = $request->user()->tickets()->create([
            'title' => $request->input('title'),
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'message' => $request->input('message'),
        ]);

        return $this->fractal->item($ticket)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * View a ticket and its associated messages.
     */
    public function view(Ticket $ticket, Request $request): array
    {
        return $this->fractal->item($ticket)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * Deletes an Ticket from the user's account.
     */
    public function delete(ClientApiRequest $request): JsonResponse
    {
        $this->validate($request, ['ticketId' => ['required', 'string']]);

        $ticket = $request->user()->tickets()
            ->where('id', $request->input('ticketId'))
            ->first();

        if (!is_null($ticket)) {
            $ticket->delete();

            TicketMessage::where('ticket_id', $ticket->id)->delete();
        }

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}
