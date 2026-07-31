<?php

namespace Everest\Http\Controllers\Api\Application;

use Everest\Models\User;
use Everest\Models\ActivityLog;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Eloquent\Relations\Relation;
use Everest\Http\Requests\Api\Application\ActivityRequest;
use Everest\Transformers\Api\Application\ActivityLogTransformer;

class ActivityLogController extends ApplicationApiController
{
    /**
     * The subject attributes checked when matching a "subject" filter value, in the
     * same priority order used by ActivityLogTransformer::identifierFor() so that a
     * search matches whatever is actually displayed as the subject's identifier.
     */
    protected const SUBJECT_IDENTIFIER_ATTRIBUTES = ['name', 'username', 'identifier', 'uuid', 'title', 'code'];

    /**
     * Returns a paginated set of administrative activity logs.
     */
    public function __invoke(ActivityRequest $request): array
    {
        $activityQuery = ActivityLog::where('is_admin', true)
            ->whereNotIn('event', ActivityLog::DISABLED_EVENTS);

        $activity = QueryBuilder::for($activityQuery)
            ->with(['actor', 'subjects.subject'])
            ->allowedFilters(...[
                AllowedFilter::partial('event'),
                AllowedFilter::partial('ip'),
                AllowedFilter::callback('actor', function ($query, $value) {
                    $query->whereHasMorph('actor', [User::class], function ($query) use ($value) {
                        $query->where('username', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::callback('subject', function ($query, $value) {
                    $query->whereHas('subjects', function ($query) use ($value) {
                        $query->whereHasMorph('subject', array_values(Relation::morphMap()), function ($query) use ($value) {
                            $columns = array_intersect(
                                self::SUBJECT_IDENTIFIER_ATTRIBUTES,
                                Schema::getColumnListing($query->getModel()->getTable()),
                            );

                            if (empty($columns)) {
                                $query->whereRaw('1 = 0');

                                return;
                            }

                            $query->where(function ($query) use ($columns, $value) {
                                foreach ($columns as $column) {
                                    $query->orWhere($column, 'like', "%{$value}%");
                                }
                            });
                        });
                    });
                }),
            ])
            ->allowedSorts(...['timestamp', 'event'])
            ->paginate(min($request->query('per_page', 25), 100))
            ->appends($request->query());

        return $this->transform($activity, ActivityLogTransformer::class);
    }
}
