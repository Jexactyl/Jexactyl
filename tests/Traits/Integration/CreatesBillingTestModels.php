<?php

namespace Everest\Tests\Traits\Integration;

use Ramsey\Uuid\Uuid;
use Everest\Models\User;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Invoice;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;
use Everest\Models\Billing\DiscountCode;
use Everest\Models\Billing\BillingException;

trait CreatesBillingTestModels
{
    /**
     * Turns the billing module on with a known, deterministic configuration so
     * tests aren't affected by whatever happens to be in the local .env.
     */
    protected function enableBilling(): void
    {
        config([
            'modules.billing.enabled' => true,
            'modules.billing.keys.secret' => 'sk_test_dummy',
            'modules.billing.currency.code' => 'USD',
            'modules.billing.currency.symbol' => '$',
            'modules.billing.renewal.days' => 30,
        ]);
    }

    /**
     * Creates a billing category pinned to the seeded egg/nest (id 1), matching
     * the fixture data every other billing integration test in this suite relies on.
     */
    protected function makeCategory(array $attributes = []): Category
    {
        return Category::create(array_merge([
            'uuid' => Uuid::uuid4()->toString(),
            'name' => 'Test Category',
            'icon' => '',
            'description' => 'test',
            'visible' => true,
            'egg_id' => 1,
            'nest_id' => 1,
        ], $attributes));
    }

    /**
     * Creates a billing product. Automatically creates a category if one is
     * not provided via the 'category_uuid' attribute.
     */
    protected function makeProduct(array $attributes = []): Product
    {
        if (!isset($attributes['category_uuid'])) {
            $attributes['category_uuid'] = $this->makeCategory()->uuid;
        }

        return Product::create(array_merge([
            'uuid' => Uuid::uuid4()->toString(),
            'name' => 'Plan-100',
            'icon' => '',
            'description' => 'test',
            'price' => 19.99,
            'visible' => true,
            'cpu_limit' => 100,
            'memory_limit' => 1024,
            'disk_limit' => 4096,
            'backup_limit' => 2,
            'database_limit' => 1,
            'allocation_limit' => 1,
        ], $attributes));
    }

    /**
     * Creates an order. Automatically creates a user and product if they are
     * not provided via 'user_id'/'product_id'.
     */
    protected function makeOrder(array $attributes = []): Order
    {
        if (!isset($attributes['user_id'])) {
            $attributes['user_id'] = User::factory()->create()->id;
        }

        if (!isset($attributes['product_id'])) {
            $attributes['product_id'] = $this->makeProduct()->id;
        }

        return Order::create(array_merge([
            'name' => Uuid::uuid4()->toString(),
            'description' => 'Test order',
            'total' => 19.99,
            'status' => Order::STATUS_PROCESSED,
            'type' => Order::TYPE_NEW,
        ], $attributes));
    }

    /**
     * Deletes every billing-related model created during the test so state does
     * not leak between tests (this suite does not use database transactions).
     */
    protected function cleanupBillingModels(): void
    {
        Invoice::query()->forceDelete();
        BillingException::query()->forceDelete();
        Order::query()->forceDelete();
        Product::query()->forceDelete();
        Category::query()->forceDelete();
        DiscountCode::query()->forceDelete();
    }
}
