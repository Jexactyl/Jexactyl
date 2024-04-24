<?php

namespace Everest\Http\Controllers\Api\Application\Tickets;

use Everest\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Transformers\Api\Application\TicketTransformer;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class TicketController extends ApplicationApiController
{
    /**
     * TicketController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Return all the tickets urrently registered on the Panel.
     */
    public function index(Request $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $tickets = QueryBuilder::for(Ticket::query())
            ->allowedFilters(['id', 'title'])
            ->allowedSorts(['id', 'title'])
            ->paginate($perPage);

        return $this->fractal->collection($tickets)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * Add a new ticket to the Panel.
     */
    public function store(Request $request): JsonResponse
    {
        $ticket = Ticket::create([
            'title' => $request->input('title'),
            'assigned_to' => $request->user()->id,
            'user_id' => $request->input('user_id'),
        ]);

        return $this->fractal->item($ticket)
            ->transformWith(TicketTransformer::class)
            ->respond(Response::HTTP_CREATED);
    }

    /**
     * View an existing ticket.
     */
    public function view(Request $request, Ticket $ticket): array
    {
        return $this->fractal->item($ticket)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * Update an existing ticket.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $ticket->update($request->all());

        return $this->fractal->item($ticket)
            ->transformWith(TicketTransformer::class)
            ->toArray();
    }

    /**
     * Update the ticket settings for the Panel.
     *
     * @throws \Throwable
     */
    public function settings(Request $request): Response
    {
        $this->settings->set('settings::modules:tickets:' . $request->input('key'), $request->input('value'));

        return $this->returnNoContent();
    }

    /**
     * Delete a ticket.
     */
    public function delete(Ticket $ticket, Request $request): Response
    {
        $ticket->messages()->delete();

        $ticket->delete();

        return $this->returnNoContent();
    }
}
