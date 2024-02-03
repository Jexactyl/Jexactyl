<?php

namespace Everest\Http\Controllers\Api\Application\Nodes;

use Everest\Models\Node;
use Illuminate\Http\Response;
use Everest\Models\Allocation;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Eloquent\Builder;
use Everest\Services\Allocations\AssignmentService;
use Everest\Services\Allocations\AllocationDeletionService;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Transformers\Api\Application\AllocationTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Allocations\GetAllocationsRequest;
use Everest\Http\Requests\Api\Application\Allocations\StoreAllocationRequest;
use Everest\Http\Requests\Api\Application\Allocations\DeleteAllocationRequest;

class AllocationController extends ApplicationApiController
{
    /**
     * AllocationController constructor.
     */
    public function __construct(
        private AssignmentService $assignmentService,
        private AllocationDeletionService $deletionService
    ) {
        parent::__construct();
    }

    /**
     * Return all the allocations that exist for a given node.
     */
    public function index(GetAllocationsRequest $request, Node $node): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $allocations = QueryBuilder::for(Allocation::query()->where('node_id', '=', $node->id))
            ->allowedFilters([
                'id', 'ip', 'port', 'alias',
                AllowedFilter::callback('server_id', function (Builder $query, $value) {
                    if ($value === '0') {
                        $query->whereNull('server_id');
                    } else {
                        $query->where('server_id', '=', $value);
                    }
                }),
            ])
            ->allowedSorts(['id', 'ip', 'port', 'server_id'])
            ->paginate($perPage);

        return $this->fractal->collection($allocations)
            ->transformWith(AllocationTransformer::class)
            ->toArray();
    }

    /**
     * Store new allocations for a given node.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Everest\Exceptions\Service\Allocation\CidrOutOfRangeException
     * @throws \Everest\Exceptions\Service\Allocation\InvalidPortMappingException
     * @throws \Everest\Exceptions\Service\Allocation\PortOutOfRangeException
     * @throws \Everest\Exceptions\Service\Allocation\TooManyPortsInRangeException
     */
    public function store(StoreAllocationRequest $request, Node $node): Response
    {
        $this->assignmentService->handle($node, $request->validated());

        return $this->returnNoContent();
    }

    /**
     * Delete a specific allocation from the Panel.
     *
     * @throws \Everest\Exceptions\Service\Allocation\ServerUsingAllocationException
     */
    public function delete(DeleteAllocationRequest $request, Node $node, Allocation $allocation): Response
    {
        $this->deletionService->handle($allocation);

        return $this->returnNoContent();
    }
}
