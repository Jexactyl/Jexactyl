<?php

namespace Everest\Services\Billing;

use Everest\Models\Node;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\BillingException;

class NodeCollectionService
{
    /**
     * Collect available nodes to deploy products to.
     */
    public function handle(Product $product): array
    {
        $available = [];
        $nodes = Node::where($product->price == 0 ? 'deployable_free' : 'deployable', true)->get();

        if (!$nodes) {
            BillingException::create([
                'title' => 'No deployable nodes found',
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'description' => 'Ensure at least one node has the "deployable" box checked',
            ]);

            return $available;
        }

        foreach ($nodes as $node) {
            $allocation = $node->allocations()->whereNull('server_id')->exists();

            if (!$allocation) {
                continue;
            }

            try {
                $this->nodeRepository->setNode($node)->getSystemInformation();
            } catch (\Exception $exception) {
                continue;
            }

            $available->push($node);
        }

        if ($available->count() == 0) {
            BillingException::create([
                'title' => 'No nodes satisfy requirements',
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'description' => 'Available nodes are offline or have no free allocations',
            ]);
        }

        return $available;
    }
}
