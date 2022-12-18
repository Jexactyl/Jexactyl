<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\TicketMessage;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Transformers\Api\Client\Tickets\TicketTransformer;
use Pterodactyl\Transformers\Api\Client\Tickets\TicketMessageTransformer;

class TicketController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all of the tickets assigned to a given client.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->fractal->collection($request->user()->tickets)
            ->transformWith($this->getTransformer(TicketTransformer::class))
            ->toArray();
    }

    /**
     * Views a specific ticket for a client.
     */
    public function view(ClientApiRequest $request, int $id): array
    {
        return $this->fractal->item(Ticket::findOrFail($id))
            ->transformWith($this->getTransformer(TicketTransformer::class))
            ->toArray();
    }

    /**
     * Gets the messages associated with a ticket.
     */
    public function viewMessages(ClientApiRequest $request, int $id): array
    {
        $messages = TicketMessage::where('ticket_id', $id)->get();

        return $this->fractal->collection($messages)
            ->transformWith($this->getTransformer(TicketMessageTransformer::class))
            ->toArray();
    }

    /**
     * Creates a new ticket on the Panel which is accessible by both
     * administrators and the specific client.
     *
     * @throws DisplayException
     */
    public function new(ClientApiRequest $request): JsonResponse
    {
        $user = $request->user()->id;
        $ticket = $request->user()->tickets();

        $model = $ticket->create([
            'client_id' => $request->user()->id,
            'title' => $request->input('title'),
            'status' => Ticket::STATUS_PENDING,
            'content' => $request->input('description'),
        ]);

        $ticket->messages()->create([
            'user_id' => $user,
            'ticket_id' => $model->id,
            'content' => $request->input('description'),
        ]);

        return new JsonResponse(['id' => $model->id]);
    }

    /**
     * Creates a new ticket message on the Panel which is accessible
     * by both administrators and the specific client.
     *
     * @throws DisplayException
     */
    public function newMessage(ClientApiRequest $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'ticket_id' => $ticket->id,
            'content' => $request->input('description'),
        ]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    /**
     * Updates the status of an existing ticket.
     *
     * @throws DisplayException
     */
    public function status(ClientApiRequest $request, int $id): JsonResponse
    {
        Ticket::findOrFail($id)->update(['status' => $request->input('status')]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}
