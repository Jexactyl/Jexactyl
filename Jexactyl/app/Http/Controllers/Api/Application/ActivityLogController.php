<?php

namespace Everest\Http\Controllers\Api\Application;

use Everest\Models\ActivityLog;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Everest\Http\Requests\Api\Application\ActivityRequest;
use Everest\Transformers\Api\Application\ActivityLogTransformer;

class ActivityLogController extends ApplicationApiController
{
    /**
     * Returns a paginated set of administrative activity logs.
     */
    public function __invoke(ActivityRequest $request): array
    {
        $activityQuery = ActivityLog::where('is_admin', true)
            ->whereNotIn('event', ActivityLog::DISABLED_EVENTS);

        $activity = QueryBuilder::for($activityQuery)
            ->with('actor')
            ->allowedFilters([AllowedFilter::partial('event')])
            ->allowedSorts(['timestamp'])
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return $this->fractal->collection($activity)
            ->transformWith(ActivityLogTransformer::class)
            ->toArray();
    }
}
