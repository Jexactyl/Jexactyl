<?php

namespace Jexactyl\Transformers\Api\Client\Store;

use Jexactyl\Transformers\Api\Client\BaseClientTransformer;

class CostTransformer extends BaseClientTransformer
{
    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return 'cost';
    }

    /**
     * Transforms a User model into a representation that can be shown to regular
     * users of the API.
     */
    public function transform(array $model): array
    {
        return [
            'cpu' => $model[0],
            'memory' => $model[1],
            'disk' => $model[2],
            'slots' => $model[3],
            'ports' => $model[4],
            'backups' => $model[5],
            'databases' => $model[6],
        ];
    }
}
