<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Node;
use League\Fractal\Resource\Item;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class NodeTransformer extends Transformer
{
    /**
     * List of resources that can be included.
     */
    protected array $availableIncludes = ['location'];

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Node::RESOURCE_NAME;
    }

    /**
     * Return a node transformed into a format that can be consumed by the
     * external client API.
     */
    public function transform(Node $model): array
    {
        $response = $model->toArray();

        $response['created_at'] = self::formatTimestamp($model->created_at);
        $response['updated_at'] = self::formatTimestamp($model->updated_at);

        return $response;
    }

    /**
     * Return the location associated with this node.
     */
    public function includeLocation(Node $node): Item|NullResource
    {
        return $this->item($node->location, new LocationTransformer());
    }
}
