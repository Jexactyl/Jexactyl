<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Models\Billing\BillingException;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Transformers\Api\Application\BillingExceptionTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Billing\Exceptions\GetBillingExceptionsRequest;
use Everest\Http\Requests\Api\Application\Billing\Exceptions\ResolveBillingExceptionRequest;

class BillingExceptionController extends ApplicationApiController
{
    /**
     * BillingExceptionController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all billing exceptions.
     */
    public function index(GetBillingExceptionsRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $categories = QueryBuilder::for(BillingException::query())
            ->allowedFilters(['id', 'title'])
            ->allowedSorts(['id', 'title', 'exception_type', 'created_at'])
            ->paginate($perPage);

        return $this->fractal->collection($categories)
            ->transformWith(BillingExceptionTransformer::class)
            ->toArray();
    }

    /**
     * Resolve a billing exception.
     */
    public function resolve(ResolveBillingExceptionRequest $request, string $uuid): Response
    {
        $exception = BillingException::where('uuid', $uuid);

        $exception->delete();

        Activity::event('admin:billing:exception-resolve')
            ->property('exception', $exception)
            ->description('A billing exception was resolved')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Resolve all billing exceptions.
     */
    public function resolveAll(ResolveBillingExceptionRequest $request): Response
    {
        $exceptions = BillingException::all();

        foreach ($exceptions as $exception) {
            $exception->delete();
        }

        Activity::event('admin:billing:exception-resolve-all')
            ->description('All billing exceptions was resolved')
            ->log();

        return $this->returnNoContent();
    }
}
