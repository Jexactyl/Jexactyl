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
    public function create(?string $intent, User $user, Product $product, ?string $status, ?string $type): Order
    {
        $order = new Order();
        $uuid = uuid_create();

        $order->name = $uuid;
        $order->payment_intent_id = $intent ?? 'free-' . substr(uuid_create(), 0, 16);
        $order->user_id = $user->id;
        $order->description = substr($uuid, 0, 8) . ' - Order for ' . $product->name . ' by ' . $user->email;
        $order->total = $product->price ?? 0;
        $order->status = $status ?? Order::STATUS_EXPIRED;
        $order->product_id = $product->id;
        $order->type = $type;

        $order->saveOrFail();

        return $order;
    }
}
