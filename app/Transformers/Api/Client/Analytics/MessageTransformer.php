<?php

namespace Pterodactyl\Transformers\Api\Client\Analytics;

use Pterodactyl\Models\AnalyticsMessage;
use Pterodactyl\Transformers\Api\Client\BaseClientTransformer;

class MessageTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return AnalyticsMessage::RESOURCE_NAME;
    }

    /**
     * Return basic information about the currently logged-in user.
     */
    public function transform(AnalyticsMessage $model): array
    {
        return [
            'id' => $model->id,
            'title' => $model->title,
            'content' => $model->content,
            'type' => $model->type,
        ];
    }
}
