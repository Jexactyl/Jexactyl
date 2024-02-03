<?php

namespace Everest\Http\Controllers\Api\Application\Nodes;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Everest\Models\Node;
use Illuminate\Http\JsonResponse;
use Illuminate\Cache\Repository as CacheRepository;
use Everest\Repositories\Wings\DaemonConfigurationRepository;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class NodeInformationController extends ApplicationApiController
{
    /**
     * NodeInformationController constructor.
     */
    public function __construct(private CacheRepository $cache, private DaemonConfigurationRepository $repository)
    {
        parent::__construct();
    }

    /**
     * Returns system information from the node.
     *
     * @throws \Everest\Exceptions\Http\Connection\DaemonConnectionException
     */
    public function __invoke(Request $request, Node $node): JsonResponse
    {
        $data = $this->repository->setNode($node)->getSystemInformation();

        return new JsonResponse([
            'version' => $data['version'] ?? null,
            'system' => [
                'type' => Str::title($data['os'] ?? 'Unknown'),
                'arch' => $data['architecture'] ?? null,
                'release' => $data['kernel_version'] ?? null,
                'cpus' => $data['cpu_count'] ?? null,
            ],
        ]);
    }
}
