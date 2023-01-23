<?php

namespace Jexactyl\Transformers\Api\Client\Analytics;

use Jexactyl\Models\AnalyticsData;
use Jexactyl\Transformers\Api\Client\BaseClientTransformer;

class DataTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return AnalyticsData::RESOURCE_NAME;
    }

    /**
     * Return basic information about the currently logged-in user.
     */
    public function transform(AnalyticsData $model): array
    {
        return [
            'id' => $model->id,
            'cpu' => $model->cpu,
            'memory' => $model->memory,
            'disk' => $model->disk,
        ];
    }
}
