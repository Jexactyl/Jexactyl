<?php

namespace Everest\Http\Controllers\Api\Application;

use Everest\Models\User;
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
            ->with(['actor', 'subjects.subject'])
            ->allowedFilters([
                AllowedFilter::partial('event'),
                AllowedFilter::partial('ip'),
                AllowedFilter::callback('actor', function ($query, $value) {
                    $query->whereHasMorph('actor', [User::class], function ($query) use ($value) {
                        $query->where('username', 'like', "%{$value}%");
                    });
                }),
            ])
            ->allowedSorts(['timestamp', 'event'])
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return $this->transform($activity, ActivityLogTransformer::class);
    }
}
