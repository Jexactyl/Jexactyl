<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\ServerGroup;
use Everest\Transformers\Api\Transformer;

class ServerGroupTransformer extends Transformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return 'server_group';
    }

    public function transform(ServerGroup $model): array
    {
        return [
            'id' => $model->id,
            'user_id' => $model->user_id,
            'name' => $model->name,
            'color' => $model->color,
        ];
    }
}
