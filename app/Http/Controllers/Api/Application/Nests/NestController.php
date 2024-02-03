<?php

namespace Everest\Http\Controllers\Api\Application\Nests;

use Everest\Models\Nest;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Services\Nests\NestUpdateService;
use Everest\Services\Nests\NestCreationService;
use Everest\Services\Nests\NestDeletionService;
use Everest\Services\Eggs\Sharing\EggImporterService;
use Everest\Transformers\Api\Application\EggTransformer;
use Everest\Transformers\Api\Application\NestTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Requests\Api\Application\Nests\GetNestRequest;
use Everest\Http\Requests\Api\Application\Eggs\ImportEggRequest;
use Everest\Http\Requests\Api\Application\Nests\GetNestsRequest;
use Everest\Http\Requests\Api\Application\Nests\StoreNestRequest;
use Everest\Http\Requests\Api\Application\Nests\DeleteNestRequest;
use Everest\Http\Requests\Api\Application\Nests\UpdateNestRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class NestController extends ApplicationApiController
{
    /**
     * NestController constructor.
     */
    public function __construct(
        private NestCreationService $nestCreationService,
        private NestDeletionService $nestDeletionService,
        private NestUpdateService $nestUpdateService,
        private EggImporterService $eggImporterService
    ) {
        parent::__construct();
    }

    /**
     * Return all Nests that exist on the Panel.
     */
    public function index(GetNestsRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $nests = QueryBuilder::for(Nest::query())
            ->allowedFilters(['id', 'name', 'author'])
            ->allowedSorts(['id', 'name', 'author']);
        if ($perPage > 0) {
            $nests = $nests->paginate($perPage);
        }

        return $this->fractal->collection($nests)
            ->transformWith(NestTransformer::class)
            ->toArray();
    }

    /**
     * Return information about a single Nest model.
     */
    public function view(GetNestRequest $request, Nest $nest): array
    {
        return $this->fractal->item($nest)
            ->transformWith(NestTransformer::class)
            ->toArray();
    }

    /**
     * Creates a new nest.
     *
     * @throws \Everest\Exceptions\Model\DataValidationException
     */
    public function store(StoreNestRequest $request): array
    {
        $nest = $this->nestCreationService->handle($request->validated());

        return $this->fractal->item($nest)
            ->transformWith(NestTransformer::class)
            ->toArray();
    }

    /**
     * Imports an egg.
     */
    public function import(ImportEggRequest $request, Nest $nest): array
    {
        $egg = $this->eggImporterService->handleContent(
            $nest->id,
            $request->getContent(),
            $request->headers->get('Content-Type'),
        );

        return $this->fractal->item($egg)
            ->transformWith(EggTransformer::class)
            ->toArray();
    }

    /**
     * Updates an existing nest.
     *
     * @throws \Everest\Exceptions\Model\DataValidationException
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     */
    public function update(UpdateNestRequest $request, Nest $nest): array
    {
        $this->nestUpdateService->handle($nest->id, $request->validated());

        return $this->fractal->item($nest)
            ->transformWith(NestTransformer::class)
            ->toArray();
    }

    /**
     * Deletes an existing nest.
     *
     * @throws \Everest\Exceptions\Service\HasActiveServersException
     */
    public function delete(DeleteNestRequest $request, Nest $nest): Response
    {
        $this->nestDeletionService->handle($nest->id);

        return $this->returnNoContent();
    }
}
