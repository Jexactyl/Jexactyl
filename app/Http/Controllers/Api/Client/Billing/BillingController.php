<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Node;
use Illuminate\Http\Request;
use Everest\Transformers\Api\Client\NodeTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class BillingController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the variables of an egg.
     */
    public function billingPortalUrl(Request $request): string
    {
        return $request->user()->billingPortalUrl(route('index'));
    }

    /**
     * Returns all the nodes that the server can be deployed to.
     */
    public function nodes(): array
    {
        $nodes = Node::where('deployable', true)->get();

        return $this->fractal->collection($nodes)
            ->transformWith(NodeTransformer::class)
            ->toArray();
    }
}
