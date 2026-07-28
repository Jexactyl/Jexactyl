<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

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
}
