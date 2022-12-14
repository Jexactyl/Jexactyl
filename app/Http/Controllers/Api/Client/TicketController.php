<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Transformers\Api\Client\Tickets\TicketTransformer;

class TicketController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all of the referral codes that exist for the given client.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->fractal->collection($request->user()->tickets)
            ->transformWith($this->getTransformer(TicketTransformer::class))
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
        $user = $request->user();

        $model = $user->tickets()->create([
            'client_id' => $user->id,
            'title' => $request->input('title'),
            'status' => Ticket::STATUS_PENDING,
            'content' => $request->input('description'),
        ]);

        return new JsonResponse(['id' => $model->id]);
    }

}
