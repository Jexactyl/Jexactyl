<?php

namespace Everest\Tests\Integration\Transformers\Api\Client;

use Carbon\Carbon;
use Everest\Tests\TestCase;
use Everest\Models\Billing\Order;
use Everest\Transformers\Api\Client\OrderTransformer;

/**
 * Lives under Integration (not Unit) despite not touching the database: this
 * transformer's constructor resolves the request/validator out of the Laravel
 * container, which only stays bootstrapped when the test extends the
 * Laravel-aware base TestCase, per-test createApplication() cycle.
 */
class OrderTransformerTest extends TestCase
{
    /**
     * Regression guard: without declaring $availableIncludes, Fractal's
     * Manager::parseIncludes() silently never calls includeServer()/includeInvoice()
     * no matter what the client requests via ?include=.
     */
    public function testItDeclaresServerAndInvoiceAsAvailableIncludes(): void
    {
        $transformer = new OrderTransformer();

        $this->assertSame(['server', 'invoice'], $transformer->getAvailableIncludes());
    }

    public function testItTransformsAnOrderIncludingMetadata(): void
    {
        $now = Carbon::parse('2026-01-15T10:00:00Z');

        $order = new Order();
        $order->id = 7;
        $order->name = 'order-uuid';
        $order->description = 'Plan-100 with ID abc';
        $order->total = 24.99;
        $order->status = Order::STATUS_PROCESSED;
        $order->product_id = 3;
        $order->type = Order::TYPE_NEW;
        $order->server_id = 9;
        $order->metadata = ['deployment_fee' => 5.5, 'discount_code' => 'SAVE5'];
        $order->created_at = $now;
        $order->updated_at = $now;

        $result = (new OrderTransformer())->transform($order);

        $this->assertSame([
            'id' => 7,
            'name' => 'order-uuid',
            'description' => 'Plan-100 with ID abc',
            'total' => 24.99,
            'status' => Order::STATUS_PROCESSED,
            'product_id' => 3,
            'type' => Order::TYPE_NEW,
            'server_id' => 9,
            'metadata' => ['deployment_fee' => 5.5, 'discount_code' => 'SAVE5'],
            'created_at' => $now->toIso8601String(),
            'updated_at' => $now->toIso8601String(),
        ], $result);
    }

    public function testMetadataIsNullWhenTheOrderHasNone(): void
    {
        $now = Carbon::now();

        $order = new Order();
        $order->id = 1;
        $order->name = 'order-uuid';
        $order->description = 'desc';
        $order->total = 0;
        $order->status = Order::STATUS_PENDING;
        $order->product_id = 1;
        $order->type = Order::TYPE_NEW;
        $order->created_at = $now;
        $order->updated_at = $now;

        $result = (new OrderTransformer())->transform($order);

        $this->assertNull($result['metadata']);
    }
}
