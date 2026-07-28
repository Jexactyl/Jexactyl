<?php

namespace Everest\Http\Controllers\Api\Application\Servers;

use Everest\Models\User;
use Everest\Models\Server;
use Everest\Facades\Activity;
use Everest\Services\Servers\StartupModificationService;
use Everest\Transformers\Api\Application\ServerTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Servers\UpdateServerStartupRequest;

class StartupController extends ApplicationApiController
{
    /**
     * StartupController constructor.
     */
    public function __construct(private StartupModificationService $modificationService)
    {
        parent::__construct();
    }

    /**
     * Update the startup and environment settings for a specific server.
     *
     * @throws \Throwable
     */
    public function index(UpdateServerStartupRequest $request, Server $server): array
    {
        $server = $this->modificationService
            ->setUserLevel(User::USER_LEVEL_ADMIN)
            ->handle($server, $request->validated());

        Activity::event('admin:servers:startup')
            ->subject($server)
            ->property('server', $server)
            ->property('new_data', $request->all())
            ->description('A server startup configuration was updated')
            ->log();

        return $this->transform($server, ServerTransformer::class);

    }
}
