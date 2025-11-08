<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Node;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Billing\CreateOrderService;
use Everest\Services\Billing\CreateServerService;
use Everest\Transformers\Api\Client\ServerTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class FreeProductController extends ClientApiController
{
    public function __construct(
        private CreateServerService $serverCreation,
        private CreateOrderService $orderService
    ) {
        parent::__construct();
    }

    /**
     * Process and validate the creation of a server
     * based off of a free product in the billing portal.
     */
    public function process(Request $request): array
    {
        $user = $request->user();
        $product = Product::findOrFail($request->input('product'));

        if (!config('modules.billing.enabled')) {
            throw new DisplayException('The billing module is not enabled.');
        }

        if ((float) $product->price !== 0.0) {
            throw new DisplayException('This product holds a value greater than zero.');
        }

        if ($user->servers()->where('billing_product_id', $request->input('product'))->count() > 0) {
            throw new DisplayException('You already own one of this free product. Nice try!');
        }

        if (!Node::findOrFail($request->input('node'))->deployable_free) {
            throw new DisplayException('Free servers cannot be deployed to this node.');
        }

        $order = $this->orderService->create(null, $user, $product, Order::STATUS_PENDING, $this->getOrderType($request));

        if ($order->type === Order::TYPE_REN && $request->has('server_id')) {
            $server = Server::findOrFail((int) $request->input('server_id'));

            $server->update([
                'renewal_date' => $server->renewal_date->addDays(30),
                'status' => $server->isSuspended() ? null : $server->status,
            ]);
        } else {
            $server = $this->serverCreation->processFree(
                $request,
                $product,
                $request->input('node'),
                $order
            );
        }

        $order->update([
            'status' => Order::STATUS_PROCESSED,
            'name' => $order->name . substr($server->uuid, 0, 8),
        ]);

        return $this->fractal->item($server)
            ->transformWith(ServerTransformer::class)
            ->toArray();
    }

    /**
     * Determine whether an order is a NEW, UPGRADE or RENEWAL.
     */
    private function getOrderType(Request $request): mixed
    {
        $type = null;

        if ($request->has('renewal') && $request->boolean('renewal')) {
            $type = Order::TYPE_REN;
        } else {
            $type = Order::TYPE_NEW;
        }

        return $type;
    }
}
