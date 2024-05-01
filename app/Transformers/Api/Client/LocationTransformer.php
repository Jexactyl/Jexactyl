<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Location;
use Everest\Transformers\Api\Transformer;

class LocationTransformer extends Transformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Location::RESOURCE_NAME;
    }

    /**
     * Return a generic transformed location array.
     */
    public function transform(Location $model): array
    {
        return [
            'id' => $model->id,
            'short' => $model->short,
        ];
    }
}
