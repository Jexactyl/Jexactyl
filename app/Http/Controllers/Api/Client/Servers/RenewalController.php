<?php

namespace Jexactyl\Http\Controllers\Api\Client\Servers;

use Jexactyl\Models\Server;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Jexactyl\Services\Servers\ServerRenewalService;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;
use Jexactyl\Http\Controllers\Api\Client\ClientApiController;

class RenewalController extends ClientApiController
{
    public function __construct(private ServerRenewalService $renewalService)
    {
        parent::__construct();
    }

    /**
     * Renew a server.
     */
    public function index(ClientApiRequest $request, Server $server): JsonResponse
    {
        $this->renewalService->handle($request, $server);

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}
