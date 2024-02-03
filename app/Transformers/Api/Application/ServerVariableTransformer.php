<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\EggVariable;
use Everest\Models\ServerVariable;
use Everest\Transformers\Api\Transformer;

class ServerVariableTransformer extends Transformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return ServerVariable::RESOURCE_NAME;
    }

    /**
     * Return a generic transformed server variable array.
     */
    public function transform(EggVariable $model): array
    {
        return $model->toArray();
    }
}
