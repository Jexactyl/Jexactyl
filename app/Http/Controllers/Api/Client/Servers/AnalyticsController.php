<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\AnalyticsData;
use Pterodactyl\Models\AnalyticsMessage;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Transformers\Api\Client\Analytics\MessageTransformer;
use Pterodactyl\Transformers\Api\Client\Analytics\AnalyticsTransformer;

class AnalyticsController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all of the analytics assigned to a given server.
     */
    public function index(ClientApiRequest $request, Server $server): array
    {
        $data = AnalyticsData::where('server_id', $server->id)->orderBy('created_at', 'desc')->get();

        return $this->fractal->collection($data)
            ->transformWith($this->getTransformer(AnalyticsTransformer::class))
            ->toArray();
    }

    /**
     * Returns all of the analytics messages assigned to a given server.
     */
    public function messages(ClientApiRequest $request, Server $server): array
    {
        $data = AnalyticsMessage::where('server_id', $server->id)->orderBy('created_at', 'desc')->get();

        return $this->fractal->collection($data)
            ->transformWith($this->getTransformer(MessageTransformer::class))
            ->toArray();
    }
}
