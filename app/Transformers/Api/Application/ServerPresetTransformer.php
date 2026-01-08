<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\ServerPreset;
use Everest\Transformers\Api\Transformer;

class ServerPresetTransformer extends Transformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return ServerPreset::RESOURCE_NAME;
    }

    /**
     * Return a generic transformed server variable array.
     */
    public function transform(ServerPreset $model): array
    {
        return $model->toArray();
    }
}
