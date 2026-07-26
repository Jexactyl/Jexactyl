<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Illuminate\Http\Request;
use Everest\Models\Billing\Order;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Exceptions\DisplayException;
use Everest\Transformers\Api\Client\OrderTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;

class OrderController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all orders.
     */
    public function index(Request $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $orders = QueryBuilder::for(Order::query())
            ->with('server')
            ->allowedIncludes(['server'])
            ->where('user_id', $request->user()->id)
            ->allowedFilters(['id', 'name', 'server_id'])
            ->allowedSorts(['id', 'name', 'total', 'is_renewal', 'created_at', 'threat_index'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->transform($orders, OrderTransformer::class);
    }

    /**
     * Return the data regarding a specific order.
     */
    public function view(Request $request, Order $order): array
    {
        if ($order->user_id !== $request->user()->id) {
            throw new DisplayException('You are not authorised to access this resource.');
        }

        return $this->transform($order, OrderTransformer::class);
    }
}
