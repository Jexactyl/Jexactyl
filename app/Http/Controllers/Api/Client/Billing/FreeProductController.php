<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Egg;
use Everest\Models\Node;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Billing\CreateOrderService;
use Everest\Services\Billing\ServerRenewalService;
use Everest\Transformers\Api\Client\ServerTransformer;
use Everest\Services\Billing\FreeServerDeploymentService;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Http\Requests\Api\Client\Billing\ProcessFreeServerRequest;

class FreeProductController extends ClientApiController
{
    public function __construct(
        private CreateOrderService $orderService,
        private ServerRenewalService $renewalService,
        private FreeServerDeploymentService $freeDeploymentService,
    ) {
        parent::__construct();
    }

    /**
     * Process and validate the creation of a server
     * based off of a free product in the billing portal.
     */
    public function process(ProcessFreeServerRequest $request): array
    {
        $user = $request->user();
        $is_new_order = !$request->filled('server_id');
        $node = Node::find($request->input('node_id'));
        $product = Product::findOrFail($request->input('product_id'));

        $this->freeDeploymentService->validate($product, $user, $node, $is_new_order);

        $egg_id = $is_new_order ? $this->resolveEggSelection($product, $request->input('egg_id')) : null;

        $order = $this->orderService->create(
            null,
            $user,
            $product,
            Order::STATUS_PENDING,
            $is_new_order ? Order::TYPE_NEW : Order::TYPE_RENEWAL,
        );

        if ($is_new_order && $node) {
            $server = $this->freeDeploymentService->handleFree(
                $user,
                $product,
                $node,
                $order,
                $request->input('variables', []),
                $egg_id,
            );

            $order->assignServer($server);
        } else {
            $server = $user->servers()
                ->where('id', $request->input('server_id'))
                ->firstOrFail();
            $order->assignServer($server);

            if ($server->renewal_date->diffInDays(now()) <= 7) {
                $order->delete();

                throw new DisplayException('You cannot renew a free server more than 7 days in advance.');
            }

            $this->renewalService->handle($server);
        }

        $order->update(['status' => Order::STATUS_PROCESSED]);

        return $this->transform($server, ServerTransformer::class);
    }

    /**
     * Validate the egg a customer selected for a product whose category doesn't pin one.
     * Categories with a fixed egg ignore any submitted selection. Returns the egg id to
     * carry through deployment, or null when the category already has a fixed egg.
     */
    private function resolveEggSelection(Product $product, mixed $submittedEggId): ?int
    {
        if ($product->category->egg_id) {
            return null;
        }

        if (!$submittedEggId) {
            throw new DisplayException('An egg must be selected to deploy this product.');
        }

        $egg = Egg::findOrFail($submittedEggId);

        if ((int) $egg->nest_id !== (int) $product->category->nest_id) {
            throw new DisplayException('The selected egg does not belong to this product\'s nest.');
        }

        return $egg->id;
    }
}
