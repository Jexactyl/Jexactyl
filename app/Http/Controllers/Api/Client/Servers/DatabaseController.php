<?php

namespace Everest\Http\Controllers\Api\Client\Servers;

use Everest\Models\Server;
use Everest\Models\Database;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Exceptions\DisplayException;
use Everest\Services\Databases\DatabasePasswordService;
use Everest\Transformers\Api\Client\DatabaseTransformer;
use Everest\Services\Databases\DatabaseManagementService;
use Everest\Services\Databases\DeployServerDatabaseService;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Http\Requests\Api\Client\Servers\Databases\GetDatabasesRequest;
use Everest\Http\Requests\Api\Client\Servers\Databases\StoreDatabaseRequest;
use Everest\Http\Requests\Api\Client\Servers\Databases\DeleteDatabaseRequest;
use Everest\Http\Requests\Api\Client\Servers\Databases\RotatePasswordRequest;

class DatabaseController extends ClientApiController
{
    /**
     * DatabaseController constructor.
     */
    public function __construct(
        private DeployServerDatabaseService $deployDatabaseService,
        private DatabaseManagementService $managementService,
        private DatabasePasswordService $passwordService,
    ) {
        parent::__construct();
    }

    /**
     * Return all the databases that belong to the given server.
     */
    public function index(GetDatabasesRequest $request, Server $server): array
    {
        return $this->transform($server->databases, DatabaseTransformer::class);
    }

    /**
     * Create a new database for the given server and return it.
     *
     * @throws \Throwable
     * @throws \Everest\Exceptions\Service\Database\TooManyDatabasesException
     * @throws \Everest\Exceptions\Service\Database\DatabaseClientFeatureNotEnabledException
     */
    public function store(StoreDatabaseRequest $request, Server $server): array
    {
        $database = Activity::event('server:database.create')->transaction(function ($log) use ($request, $server) {
            if ($server->databases()->lockForUpdate()->count() >= $server->database_limit) {
                throw new DisplayException('Cannot create additional databases on this server: limit has been reached.');
            }

            $database = $this->deployDatabaseService->handle($server, $request->validated());

            $log->subject($database)->property('name', $database->database);

            return $database;
        });

        return $this->fractal->item($database)
            ->parseIncludes(['password'])
            ->transformWith(DatabaseTransformer::class)
            ->toArray();
    }

    /**
     * Rotates the password for the given server model and returns a fresh instance to
     * the caller.
     *
     * @throws \Throwable
     */
    public function rotatePassword(RotatePasswordRequest $request, Server $server, Database $database): array
    {
        Activity::event('server:database.rotate-password')
            ->subject($database)
            ->property('name', $database->database)
            ->transaction(fn () => $this->passwordService->handle($database));

        return $this->fractal->item($database->refresh())
            ->parseIncludes(['password'])
            ->transformWith(DatabaseTransformer::class)
            ->toArray();
    }

    /**
     * Removes a database from the server.
     *
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     */
    public function delete(DeleteDatabaseRequest $request, Server $server, Database $database): Response
    {
        $this->managementService->delete($database);

        Activity::event('server:database.delete')
            ->subject($database)
            ->property('name', $database->database)
            ->log();

        return $this->returnNoContent();
    }
}
