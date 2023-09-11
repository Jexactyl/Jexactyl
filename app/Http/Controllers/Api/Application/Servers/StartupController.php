<?php

namespace Jexactyl\Http\Controllers\Api\Application\Servers;

use Jexactyl\Models\User;
use Jexactyl\Models\Server;
use Jexactyl\Services\Servers\StartupModificationService;
use Jexactyl\Transformers\Api\Application\ServerTransformer;
use Jexactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Jexactyl\Http\Requests\Api\Application\Servers\UpdateServerStartupRequest;

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
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Jexactyl\Exceptions\Http\Connection\DaemonConnectionException
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function index(UpdateServerStartupRequest $request, Server $server): array
    {
        $server = $this->modificationService
            ->setUserLevel(User::USER_LEVEL_ADMIN)
            ->handle($server, $request->validated());

        return $this->fractal->item($server)
            ->transformWith($this->getTransformer(ServerTransformer::class))
            ->toArray();
    }
}
