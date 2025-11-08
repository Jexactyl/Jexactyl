<?php

namespace Everest\Http\Controllers\Api\Application\Servers;

use Everest\Models\Server;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Services\Servers\ServerCreationService;
use Everest\Services\Servers\ServerDeletionService;
use Everest\Services\Servers\BuildModificationService;
use Everest\Services\Servers\DetailsModificationService;
use Everest\Transformers\Api\Application\ServerTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Requests\Api\Application\Servers\GetServerRequest;
use Everest\Http\Requests\Api\Application\Servers\GetServersRequest;
use Everest\Http\Requests\Api\Application\Servers\StoreServerRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Servers\DeleteServerRequest;
use Everest\Http\Requests\Api\Application\Servers\UpdateServerRequest;

class ServerController extends ApplicationApiController
{
    /**
     * ServerController constructor.
     */
    public function __construct(
        private BuildModificationService $buildModificationService,
        private DetailsModificationService $detailsModificationService,
        private ServerCreationService $creationService,
        private ServerDeletionService $deletionService
    ) {
        parent::__construct();
    }

    /**
     * Return all the servers that currently exist on the Panel.
     */
    public function index(GetServersRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $servers = QueryBuilder::for(Server::query())
            ->allowedFilters(['id', 'uuid', 'uuidShort', 'name', 'owner_id', 'node_id', 'external_id'])
            ->allowedSorts(['id', 'uuid', 'uuidShort', 'name', 'owner_id', 'node_id', 'status'])
            ->paginate($perPage);

        return $this->fractal->collection($servers)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }

    /**
     * Create a new server on the system.
     *
     * @throws \Throwable
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     * @throws \Everest\Exceptions\Service\Deployment\NoViableAllocationException
     * @throws \Everest\Exceptions\Service\Deployment\NoViableNodeException
     */
    public function store(StoreServerRequest $request): JsonResponse
    {
        $server = $this->creationService->handle($request->validated());

        Activity::event('admin:servers:create')
            ->property('server', $server)
            ->description('A server was created')
            ->log();

        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->respond(Response::HTTP_CREATED);
    }

    /**
     * Show a single server transformed for the application API.
     */
    public function view(GetServerRequest $request, Server $server): array
    {
        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }

    /**
     * Deletes a server.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Throwable
     */
    public function delete(DeleteServerRequest $request, Server $server): Response
    {
        $force = (bool) $request->input('force') ?? false;

        $this->deletionService->withForce($force)->handle($server);

        Activity::event('admin:servers:delete')
            ->property('server', $server)
            ->description('A server was deleted')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Update a server.
     *
     * @throws \Throwable
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     * @throws \Everest\Exceptions\Service\Deployment\NoViableAllocationException
     * @throws \Everest\Exceptions\Service\Deployment\NoViableNodeException
     */
    public function update(UpdateServerRequest $request, Server $server): array
    {
        $server = $this->buildModificationService->handle($server, $request->validated());
        $server = $this->detailsModificationService->returnUpdatedModel()->handle($server, $request->validated());

        Activity::event('admin:servers:update')
            ->property('server', $server)
            ->property('new_data', $request->all())
            ->description('A server was updated')
            ->log();

        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }
}
