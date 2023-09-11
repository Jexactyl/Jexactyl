<?php

namespace Jexactyl\Http\Controllers\Api\Client\Servers;

use Jexactyl\Models\Server;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Jexactyl\Exceptions\DisplayException;
use Jexactyl\Services\Servers\ServerEditService;
use Jexactyl\Http\Controllers\Api\Client\ClientApiController;
use Jexactyl\Http\Requests\Api\Client\Servers\EditServerRequest;

class EditController extends ClientApiController
{
    /**
     * PowerController constructor.
     */
    public function __construct(private ServerEditService $editService)
    {
        parent::__construct();
    }

    /**
     * Edit a server's resource limits.
     *
     * @throws DisplayException
     */
    public function index(EditServerRequest $request, Server $server): JsonResponse
    {
        if ($this->settings->get('jexactyl::renewal:editing') != 'true') {
            throw new DisplayException('Server editing is currently disabled.');
        }

        if ($request->user()->id != $server->owner_id) {
            throw new DisplayException('You do not own this server, so you cannot edit the resources.');
        }

        $this->editService->handle($request, $server);

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}
