<?php

namespace Everest\Tests\Integration\Api\Client\Billing;

use Ramsey\Uuid\Uuid;
use Stripe\StripeClient;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class StripeControllerTest extends ClientApiIntegrationTestCase
{
    private function enableBilling(): void
    {
        config([
            'modules.billing.enabled' => true,
            'modules.billing.keys.secret' => 'sk_test_dummy',
            'modules.billing.currency.code' => 'USD',
            'modules.billing.currency.symbol' => '$',
            'modules.billing.renewal.days' => 30,
        ]);
    }

    private function makeProduct(): Product
    {
        $category = Category::create([
            'uuid' => Uuid::uuid4()->toString(),
            'name' => 'Test',
            'icon' => '',
            'description' => 'test',
            'visible' => true,
            'egg_id' => 1,
            'nest_id' => 1,
        ]);

        return Product::create([
            'uuid' => Uuid::uuid4()->toString(),
            'category_uuid' => $category->uuid,
            'name' => 'Plan-100',
            'icon' => '',
            'description' => 'test',
            'price' => 100.00,
            'visible' => true,
            'cpu_limit' => 100,
            'memory_limit' => 1024,
            'disk_limit' => 1024,
            'backup_limit' => 0,
            'database_limit' => 0,
            'allocation_limit' => 0,
        ]);
    }

    /**
     * Binds a StripeClient into the container whose checkout.sessions.retrieve returns
     * a session reporting 'paid' with the given amount and currency, so the controller
     * resolves it in place of the real client.
     */
    private function stubSession(string $sessionId, int $amountTotal, string $currency, array $metadata): void
    {
        $session = (object) [
            'id' => $sessionId,
            'payment_status' => 'paid',
            'amount_total' => $amountTotal,
            'currency' => $currency,
            'metadata' => (object) $metadata,
        ];

        $sessions = \Mockery::mock();
        $sessions->shouldReceive('retrieve')->with($sessionId)->andReturn($session);

        // StripeClient resolves service accessors (e.g. `->checkout`) via getService(),
        // so the mock answers that instead of the real service factory.
        $client = \Mockery::mock(StripeClient::class);
        $client->shouldReceive('getService')->with('checkout')->andReturn(
            (object) ['sessions' => $sessions]
        );

        $this->app->instance(StripeClient::class, $client);
    }

    public function testMismatchedCurrencyPaymentIsRejected(): void
    {
        $this->enableBilling();
        $user = \Everest\Models\User::factory()->create();
        $server = $this->createServerModel(['user_id' => $user->id, 'renewal_date' => now()->subDays(30)]);
        $product = $this->makeProduct();
        $server->update(['billing_product_id' => $product->id]);

        $sessionId = 'cs_test_reject';
        $order = Order::create([
            'name' => Uuid::uuid4()->toString(),
            'transaction_id' => $sessionId,
            'user_id' => $user->id,
            'description' => 'renewal',
            'total' => 100.00,
            'status' => Order::STATUS_PENDING,
            'product_id' => $product->id,
            'type' => Order::TYPE_RENEWAL,
        ]);
        $order->assignServer($server);

        // Paid, but 100 JPY (~$0.63) instead of $100.00 USD.
        $this->stubSession($sessionId, 100, 'jpy', [
            'user_id' => (string) $user->id,
            'product_id' => (string) $product->id,
            'server_id' => (string) $server->id,
            'order_type' => Order::TYPE_RENEWAL,
            'discount_code' => '',
        ]);

        $response = $this->actingAs($user)->postJson('/api/client/billing/stripe/process', [
            'session' => $sessionId,
        ]);

        $response->assertStatus(400);
        $this->assertSame(Order::STATUS_PENDING, $order->refresh()->status);
    }

    public function testMatchingPaymentIsAccepted(): void
    {
        $this->enableBilling();
        $user = \Everest\Models\User::factory()->create();
        $server = $this->createServerModel(['user_id' => $user->id, 'renewal_date' => now()->subDays(30)]);
        $product = $this->makeProduct();
        $server->update(['billing_product_id' => $product->id]);

        $sessionId = 'cs_test_accept';
        $order = Order::create([
            'name' => Uuid::uuid4()->toString(),
            'transaction_id' => $sessionId,
            'user_id' => $user->id,
            'description' => 'renewal',
            'total' => 100.00,
            'status' => Order::STATUS_PENDING,
            'product_id' => $product->id,
            'type' => Order::TYPE_RENEWAL,
        ]);
        $order->assignServer($server);

        // Paid $100.00 USD, matching the order.
        $this->stubSession($sessionId, 10000, 'usd', [
            'user_id' => (string) $user->id,
            'product_id' => (string) $product->id,
            'server_id' => (string) $server->id,
            'order_type' => Order::TYPE_RENEWAL,
            'discount_code' => '',
        ]);

        $response = $this->actingAs($user)->postJson('/api/client/billing/stripe/process', [
            'session' => $sessionId,
        ]);

        $response->assertStatus(200);
        $this->assertSame(Order::STATUS_PROCESSED, $order->refresh()->status);
    }
}
