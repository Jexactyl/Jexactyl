<?php

namespace Everest\Http\Controllers\Api\Application\Nodes;

use Everest\Models\Node;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Services\Nodes\NodeUpdateService;
use Everest\Services\Nodes\NodeCreationService;
use Everest\Services\Nodes\NodeDeletionService;
use Everest\Transformers\Api\Application\NodeTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Requests\Api\Application\Nodes\GetNodeRequest;
use Everest\Http\Requests\Api\Application\Nodes\GetNodesRequest;
use Everest\Http\Requests\Api\Application\Nodes\StoreNodeRequest;
use Everest\Http\Requests\Api\Application\Nodes\DeleteNodeRequest;
use Everest\Http\Requests\Api\Application\Nodes\UpdateNodeRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class NodeController extends ApplicationApiController
{
    /**
     * NodeController constructor.
     */
    public function __construct(
        private NodeCreationService $creationService,
        private NodeDeletionService $deletionService,
        private NodeUpdateService $updateService
    ) {
        parent::__construct();
    }

    /**
     * Return all the nodes currently available on the Panel.
     */
    public function index(GetNodesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $nodes = QueryBuilder::for(Node::query())
            ->allowedFilters(['id', 'uuid', 'name', 'fqdn', 'daemon_token_id'])
            ->allowedSorts(['id', 'uuid', 'name', 'location_id', 'fqdn', 'memory', 'disk'])
            ->paginate($perPage);

        return $this->fractal->collection($nodes)
            ->transformWith(NodeTransformer::class)
            ->toArray();
    }

    /**
     * Return data for a single instance of a node.
     */
    public function view(GetNodeRequest $request, Node $node): array
    {
        return $this->fractal->item($node)
            ->transformWith(NodeTransformer::class)
            ->toArray();
    }

    /**
     * Create a new node on the Panel. Returns the created node and an HTTP/201
     * status response on success.
     *
     * @throws \Everest\Exceptions\Model\DataValidationException
     */
    public function store(StoreNodeRequest $request): JsonResponse
    {
        $node = $this->creationService->handle($request->validated());

        return $this->fractal->item($node)
            ->transformWith(NodeTransformer::class)
            ->respond(201);
    }

    /**
     * Update an existing node on the Panel.
     *
     * @throws \Throwable
     */
    public function update(UpdateNodeRequest $request, Node $node): array
    {
        $node = $this->updateService->handle(
            $node,
            $request->validated(),
        );

        return $this->fractal->item($node)
            ->transformWith(NodeTransformer::class)
            ->toArray();
    }

    /**
     * Deletes a given node from the Panel as long as there are no servers
     * currently attached to it.
     *
     * @throws \Everest\Exceptions\Service\HasActiveServersException
     */
    public function delete(DeleteNodeRequest $request, Node $node): Response
    {
        $this->deletionService->handle($node);

        return $this->returnNoContent();
    }
}
