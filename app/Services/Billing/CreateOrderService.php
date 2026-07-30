<?php

namespace Everest\Services\Billing;

use Everest\Models\User;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;

class CreateOrderService
{
    /**
     * Process the creation of an order.
     */
    public function create(?string $transaction_id, User $user, Product $product, ?string $status, string $type, ?float $price = null, ?array $metadata = null): Order
    {
        $order = new Order();
        $uuid = uuid_create();
        $deploymentFee = (float) ($metadata['deployment_fee'] ?? 0);

        $order->name = $uuid;
        $order->transaction_id = $transaction_id;
        $order->user_id = $user->id;
        $order->description = $product->name . ' with ID ' . substr($uuid, 0, 8);
        $order->total = ($price ?? $product->price ?? 0) + $deploymentFee;
        $order->metadata = $metadata;
        $order->status = $status ?? Order::STATUS_EXPIRED;
        $order->product_id = $product->id;
        $order->type = $type;

        $order->saveOrFail();

        return $order;
    }
}
