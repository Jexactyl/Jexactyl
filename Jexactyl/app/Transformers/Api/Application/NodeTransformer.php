<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Node;
use Everest\Services\Acl\Api\AdminAcl;
use League\Fractal\Resource\Collection;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class NodeTransformer extends Transformer
{
    /**
     * List of resources that can be included.
     */
    protected array $availableIncludes = ['allocations', 'servers'];

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Node::RESOURCE_NAME;
    }

    /**
     * Return a node transformed into a format that can be consumed by the
     * external administrative API.
     */
    public function transform(Node $model): array
    {
        $response = $model->toArray();

        $response['created_at'] = $model->created_at->toIso8601String();
        $response['updated_at'] = $model->updated_at->toIso8601String();

        $resources = $model->servers()->select(['memory', 'disk'])->get();

        $response['allocated_resources'] = [
            'memory' => $resources->sum('memory'),
            'disk' => $resources->sum('disk'),
        ];

        return $response;
    }

    /**
     * Return the allocations associated with this node.
     */
    public function includeAllocations(Node $node): Collection|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_ALLOCATIONS)) {
            return $this->null();
        }

        return $this->collection($node->allocations, new AllocationTransformer());
    }

    /**
     * Return the servers associated with this node.
     */
    public function includeServers(Node $node): Collection|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_SERVERS)) {
            return $this->null();
        }

        return $this->collection($node->servers, new ServerTransformer());
    }
}
