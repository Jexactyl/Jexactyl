<?php

namespace Jexactyl\Transformers\Api\Client\Store;

use Jexactyl\Models\Egg;
use Jexactyl\Transformers\Api\Client\BaseClientTransformer;

class EggTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Egg::RESOURCE_NAME;
    }

    /**
     * Transforms the Egg model into a representation that can be consumed by
     * the application api.
     */
    public function transform(Egg $model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'docker_images' => $model->docker_images,
        ];
    }
}
