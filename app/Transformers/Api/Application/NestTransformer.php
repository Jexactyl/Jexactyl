<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Nest;
use Everest\Services\Acl\Api\AdminAcl;
use League\Fractal\Resource\Collection;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class NestTransformer extends Transformer
{
    /**
     * Relationships that can be loaded onto this transformation.
     */
    protected array $availableIncludes = ['eggs', 'servers'];

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Nest::RESOURCE_NAME;
    }

    /**
     * Transform a Nest model into a representation that can be consumed by the
     * application API.
     */
    public function transform(Nest $model): array
    {
        $response = $model->toArray();

        $response['created_at'] = self::formatTimestamp($model->created_at);
        $response['updated_at'] = self::formatTimestamp($model->updated_at);

        return $response;
    }

    /**
     * Include the Eggs relationship on the given Nest model transformation.
     */
    public function includeEggs(Nest $model): Collection|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_EGGS)) {
            return $this->null();
        }

        return $this->collection($model->eggs, new EggTransformer());
    }

    /**
     * Include the servers relationship on the given Nest model.
     */
    public function includeServers(Nest $model): Collection|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_SERVERS)) {
            return $this->null();
        }

        return $this->collection($model->servers, new ServerTransformer());
    }
}
