<?php

namespace Jexactyl\Http\Controllers\Api\Application\Servers;

use Jexactyl\Models\Server;
use Jexactyl\Transformers\Api\Application\ServerTransformer;
use Jexactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Jexactyl\Http\Requests\Api\Application\Servers\GetExternalServerRequest;

class ExternalServerController extends ApplicationApiController
{
    /**
     * Retrieve a specific server from the database using its external ID.
     */
    public function index(GetExternalServerRequest $request, string $external_id): array
    {
        $server = Server::query()->where('external_id', $external_id)->firstOrFail();

        return $this->fractal->item($server)
            ->transformWith($this->getTransformer(ServerTransformer::class))
            ->toArray();
    }
}
