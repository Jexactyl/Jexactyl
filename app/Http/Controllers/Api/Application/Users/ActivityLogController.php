<?php

namespace Everest\Http\Controllers\Api\Application\Users;

use Everest\Models\User;
use Everest\Models\ActivityLog;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Everest\Transformers\Api\Application\ActivityLogTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Users\GetUserActivityRequest;

class ActivityLogController extends ApplicationApiController
{
    /**
     * Returns a paginated set of activity logs where the given user is the subject.
     */
    public function __invoke(GetUserActivityRequest $request, User $user): array
    {
        $activity = QueryBuilder::for($user->activity())
            ->with(['actor', 'subjects.subject'])
            ->allowedFilters(...[
                AllowedFilter::partial('event'),
                AllowedFilter::partial('ip'),
            ])
            ->allowedSorts(...['timestamp', 'event'])
            ->whereNotIn('activity_logs.event', ActivityLog::DISABLED_EVENTS)
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return $this->transform($activity, ActivityLogTransformer::class);
    }
}
