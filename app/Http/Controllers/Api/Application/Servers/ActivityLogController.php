<?php

namespace Everest\Http\Controllers\Api\Application\Servers;

use Everest\Models\Server;
use Everest\Models\ActivityLog;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Servers\GetServerActivityRequest;
use Everest\Transformers\Api\Application\ActivityLogTransformer;

class ActivityLogController extends ApplicationApiController
{
    /**
     * Returns a paginated set of activity logs where the given server is the subject.
     */
    public function __invoke(GetServerActivityRequest $request, Server $server): array
    {
        $activity = QueryBuilder::for($server->activity())
            ->with(['actor', 'subjects.subject'])
            ->allowedFilters([
                AllowedFilter::partial('event'),
                AllowedFilter::partial('ip'),
            ])
            ->allowedSorts(['timestamp', 'event'])
            ->whereNotIn('activity_logs.event', ActivityLog::DISABLED_EVENTS)
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return $this->transform($activity, ActivityLogTransformer::class);
    }
}
