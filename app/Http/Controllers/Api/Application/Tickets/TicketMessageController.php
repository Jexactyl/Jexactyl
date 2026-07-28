<?php

namespace Everest\Http\Controllers\Api\Application\Tickets;

use Everest\Models\Ticket;
use Everest\Facades\Activity;
use Everest\Models\TicketMessage;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Http\Requests\Api\Application\Tickets;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Transformers\Api\Application\TicketMessageTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class TicketMessageController extends ApplicationApiController
{
    /**
     * TicketMessageController constructor.
     */
    public function __construct(
    ) {
        parent::__construct();
    }

    /**
     * Return all the ticket messages currently registered on the Panel.
     */
    public function index(Ticket $ticket, Tickets\ViewTicketRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $messages = QueryBuilder::for(TicketMessage::query())
            ->allowedFilters(['id'])
            ->allowedSorts(['id'])
            ->where('ticket_id', $ticket->id)
            ->paginate($perPage);

        return $this->transform($messages, TicketMessageTransformer::class);
    }

    /**
     * Add a new message to a ticket.
     */
    public function store(Tickets\StoreTicketMessageRequest $request): array
    {
        $ticket = Ticket::findOrFail($request['ticket_id']);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'message' => $request->input('message'),
        ]);

        Activity::event('admin:tickets:message')
            ->subject($ticket)
            ->property('ticket', $ticket)
            ->description('A message was added to a ticket')
            ->log();

        return $this->transform($message, TicketMessageTransformer::class);
    }
}
