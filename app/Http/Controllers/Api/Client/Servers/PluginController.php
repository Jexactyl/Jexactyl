<?php

namespace Jexactyl\Http\Controllers\Api\Client\Servers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Jexactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Jexactyl\Exceptions\DisplayException;
use Jexactyl\Repositories\Wings\DaemonFileRepository;
use Jexactyl\Http\Controllers\Api\Client\ClientApiController;
use Jexactyl\Http\Requests\Api\Client\Servers\Files\PullFileRequest;

class PluginController extends ClientApiController
{
    /**
     * PluginController constructor.
     */
    public function __construct(private DaemonFileRepository $fileRepository)
    {
        parent::__construct();
    }

    /**
     * List all plugins from the Spigot API.
     *
     * @throws DisplayException
     */
    public function index(Request $request): ?array
    {
        $query = $request->input('query');
        if (!$query) {
            return null;
        }

        $client = new Client();

        $api = 'https://api.spiget.org/v2/search/resources/' . urlencode($query) . '?page=1&size=18';

        try {
            $res = $client->request('GET', $api, ['headers' => ['User-Agent' => 'jexactyl/3.x']]);
        } catch (DisplayException $e) {
            throw new DisplayException('Couldn\'t find any results for that query.');
        }

        $plugins = json_decode($res->getBody(), true);

        return [
            'success' => true,
            'data' => [
                'plugins' => $plugins,
            ],
        ];
    }

    /**
     * Install the plugin using the Panel.
     *
     * @throws DisplayException
     */
    public function install(PullFileRequest $request, Server $server, int $id): JsonResponse
    {
        $this->fileRepository->setServer($server)->pull(
            'https://cdn.spiget.org/file/spiget-resources/' . $id . '.jar',
            '/plugins',
            $request->safe(['filename', 'use_header', 'foreground'])
        );

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}
