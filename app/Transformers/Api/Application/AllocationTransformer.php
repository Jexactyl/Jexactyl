<?php

namespace Jexactyl\Transformers\Api\Application;

use Jexactyl\Models\Node;
use Jexactyl\Models\Server;
use Jexactyl\Models\Allocation;
use League\Fractal\Resource\Item;
use Jexactyl\Services\Acl\Api\AdminAcl;
use League\Fractal\Resource\NullResource;

class AllocationTransformer extends BaseTransformer
{
    /**
     * Relationships that can be loaded onto allocation transformations.
     */
    protected array $availableIncludes = ['node', 'server'];

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Allocation::RESOURCE_NAME;
    }

    /**
     * Return a generic transformed allocation array.
     */
    public function transform(Allocation $allocation): array
    {
        return [
            'id' => $allocation->id,
            'ip' => $allocation->ip,
            'alias' => $allocation->ip_alias,
            'port' => $allocation->port,
            'notes' => $allocation->notes,
            'assigned' => !is_null($allocation->server_id),
        ];
    }

    /**
     * Load the node relationship onto a given transformation.
     *
     * @throws \Jexactyl\Exceptions\Transformer\InvalidTransformerLevelException
     */
    public function includeNode(Allocation $allocation): Item|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_NODES)) {
            return $this->null();
        }

        return $this->item(
            $allocation->node,
            $this->makeTransformer(NodeTransformer::class),
            Node::RESOURCE_NAME
        );
    }

    /**
     * Load the server relationship onto a given transformation.
     *
     * @throws \Jexactyl\Exceptions\Transformer\InvalidTransformerLevelException
     */
    public function includeServer(Allocation $allocation): Item|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_SERVERS) || !$allocation->server) {
            return $this->null();
        }

        return $this->item(
            $allocation->server,
            $this->makeTransformer(ServerTransformer::class),
            Server::RESOURCE_NAME
        );
    }
}
