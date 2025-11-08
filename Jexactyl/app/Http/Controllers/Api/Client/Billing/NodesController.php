<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Node;
use Illuminate\Http\Request;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\BillingException;
use Everest\Transformers\Api\Client\NodeTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Repositories\Wings\DaemonConfigurationRepository;

class NodesController extends ClientApiController
{
    public function __construct(private DaemonConfigurationRepository $repository)
    {
        parent::__construct();
    }

    /**
     * Returns all the nodes that the server can be deployed to.
     */
    public function index(Request $request, Product $product): array
    {
        $free = (float) $product->price === 0.00;

        $nodes = Node::where($free ? 'deployable_free' : 'deployable', true)->get();

        if ($nodes->isEmpty() && !$free) {
            BillingException::create([
                'title' => 'No deployable nodes found',
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'description' => 'Ensure at least one node has the "deployable" box checked',
            ]);

            return $this->fractal->collection(collect())
                ->transformWith(NodeTransformer::class)
                ->toArray();
        }

        $availableNodes = collect();

        foreach ($nodes as $node) {
            $hasFreeAllocation = $node->allocations()->whereNull('server_id')->exists();
            if (!$hasFreeAllocation) {
                continue;
            }

            try {
                $this->repository->setNode($node)->getSystemInformation();
            } catch (\Throwable $e) {
                continue;
            }

            $availableNodes->push($node);
        }

        if ($availableNodes->isEmpty()) {
            BillingException::create([
                'title' => 'No nodes satisfy requirements',
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'description' => 'Available nodes are either offline or have zero free allocations',
            ]);
        }

        return $this->fractal->collection($availableNodes)
            ->transformWith(NodeTransformer::class)
            ->toArray();
    }
}
