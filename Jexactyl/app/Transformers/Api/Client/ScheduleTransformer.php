<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Schedule;
use League\Fractal\Resource\Collection;
use Everest\Transformers\Api\Transformer;

class ScheduleTransformer extends Transformer
{
    protected array $availableIncludes = ['tasks'];

    protected array $defaultIncludes = ['tasks'];

    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return Schedule::RESOURCE_NAME;
    }

    /**
     * Returns a transformed schedule model such that a client can view the information.
     */
    public function transform(Schedule $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'cron' => [
                'day_of_week' => $model->cron_day_of_week,
                'day_of_month' => $model->cron_day_of_month,
                'month' => $model->cron_month,
                'hour' => $model->cron_hour,
                'minute' => $model->cron_minute,
            ],
            'is_active' => $model->is_active,
            'is_processing' => $model->is_processing,
            'only_when_online' => $model->only_when_online,
            'last_run_at' => $model->last_run_at->toIso8601String(),
            'next_run_at' => $model->next_run_at->toIso8601String(),
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String(),
        ];
    }

    /**
     * Allows attaching the tasks specific to the schedule in the response.
     */
    public function includeTasks(Schedule $model): Collection
    {
        return $this->collection($model->tasks, new TaskTransformer());
    }
}
