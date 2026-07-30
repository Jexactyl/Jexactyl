<?php

namespace Everest\Tests\Integration\Services\Billing;

use Everest\Models\User;
use Everest\Models\Billing\Order;
use Illuminate\Support\Facades\Storage;
use Everest\Services\Billing\InvoiceGenerationService;
use Everest\Tests\Traits\Integration\CreatesBillingTestModels;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class InvoiceGenerationServiceTest extends ClientApiIntegrationTestCase
{
    use CreatesBillingTestModels;

    private InvoiceGenerationService $service;

    public function setUp(): void
    {
        parent::setUp();

        $this->enableBilling();
        $this->service = $this->app->make(InvoiceGenerationService::class);

        Storage::fake('local');
    }

    protected function tearDown(): void
    {
        $this->cleanupBillingModels();

        parent::tearDown();
    }

    public function testItGeneratesAnInvoiceWithServerNodeAndEggDetails(): void
    {
        $user = User::factory()->create();
        $server = $this->createServerModel(['user_id' => $user->id, 'renewal_date' => now()->addDays(30)]);
        $product = $this->makeProduct();
        $order = $this->makeOrder([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'total' => $product->price,
        ]);
        $order->assignServer($server);

        $invoice = $this->service->generate($order->fresh());

        $this->assertNotEmpty($invoice->uuid);
        $this->assertSame($order->id, $invoice->order_id);
        $this->assertSame(sprintf('INV-%06d', $order->id), $invoice->number);
        $this->assertSame('local', $invoice->disk);
        $this->assertSame("invoices/{$user->id}/{$invoice->uuid}.pdf", $invoice->path);
        $this->assertNotNull($invoice->generated_at);

        Storage::disk('local')->assertExists($invoice->path);
        $this->assertGreaterThan(0, Storage::disk('local')->size($invoice->path));
        // A real PDF file starts with the "%PDF-" magic bytes.
        $this->assertStringStartsWith('%PDF-', Storage::disk('local')->get($invoice->path));

        $snapshot = $invoice->snapshot;
        $this->assertSame($invoice->number, $snapshot['invoice_number']);
        $this->assertSame($order->id, $snapshot['order_id']);
        $this->assertSame(Order::TYPE_NEW, $snapshot['order_type']);
        $this->assertSame($server->name, $snapshot['server']['name']);
        $this->assertSame($server->node->name, $snapshot['node']['name']);
        $this->assertSame($server->node->fqdn, $snapshot['node']['fqdn']);
        $this->assertSame($server->egg->name, $snapshot['egg']['name']);
        $this->assertSame($product->name, $snapshot['product']['name']);
        $this->assertSame($server->renewal_date->toIso8601String(), $snapshot['expires_at']);
        $this->assertSame($user->username, $snapshot['billed_to']['username']);
        $this->assertSame($user->email, $snapshot['billed_to']['email']);
        $this->assertSame('USD', $snapshot['currency']['code']);
    }

    public function testItGeneratesAnInvoiceForAnOrderWithoutAServer(): void
    {
        $order = $this->makeOrder();

        $invoice = $this->service->generate($order->fresh());

        $this->assertNull($invoice->snapshot['server']);
        $this->assertNull($invoice->snapshot['node']);
        $this->assertNull($invoice->snapshot['egg']);
        $this->assertNull($invoice->snapshot['expires_at']);
        Storage::disk('local')->assertExists($invoice->path);
    }

    public function testSnapshotIncludesDeploymentFeeAsALineItemAndReconcilesTheTotal(): void
    {
        $product = $this->makeProduct(['price' => 10.00]);
        $order = $this->makeOrder([
            'product_id' => $product->id,
            'total' => 15.00, // 10.00 product + 5.00 deployment fee
            'metadata' => ['deployment_fee' => 5.00],
        ]);

        $invoice = $this->service->generate($order->fresh());
        $snapshot = $invoice->snapshot;

        // assertEquals (not assertSame): snapshot round-trips through a JSON
        // column, and PHP's json_encode drops the ".0" off whole-number floats,
        // so a stored 5.0 can legitimately come back as int 5 — the numeric
        // value is what matters here, not whether PHP considers it a float.
        $this->assertEquals(5.0, $snapshot['deployment_fee']);
        $this->assertEquals(10.0, $snapshot['subtotal']);
        $this->assertEquals(15.0, $snapshot['total']);

        $feeLine = collect($snapshot['line_items'])->firstWhere('description', 'Deployment Fee (one-time)');
        $this->assertNotNull($feeLine);
        $this->assertEquals(5.0, $feeLine['amount']);

        $reconciled = array_sum(array_column($snapshot['line_items'], 'amount'));
        $this->assertEqualsWithDelta($snapshot['total'], $reconciled, 0.001);
    }

    public function testSnapshotIncludesDiscountAsANegativeLineItemAndReconcilesTheTotal(): void
    {
        $product = $this->makeProduct(['price' => 20.00]);
        $order = $this->makeOrder([
            'product_id' => $product->id,
            'total' => 15.00, // 20.00 subtotal - 5.00 discount
            'metadata' => ['discount_code' => 'SAVE5', 'subtotal' => 20.00],
        ]);

        $invoice = $this->service->generate($order->fresh());
        $snapshot = $invoice->snapshot;

        $this->assertSame('SAVE5', $snapshot['discount_code']);
        $this->assertEquals(20.0, $snapshot['subtotal']);
        $this->assertEquals(5.0, $snapshot['discount_amount']);
        $this->assertEquals(15.0, $snapshot['total']);

        $discountLine = collect($snapshot['line_items'])->firstWhere('description', 'Discount (SAVE5)');
        $this->assertNotNull($discountLine);
        $this->assertEquals(-5.0, $discountLine['amount']);

        $reconciled = array_sum(array_column($snapshot['line_items'], 'amount'));
        $this->assertEqualsWithDelta($snapshot['total'], $reconciled, 0.001);
    }

    public function testSnapshotHandlesDiscountAndDeploymentFeeTogether(): void
    {
        $product = $this->makeProduct(['price' => 20.00]);
        $order = $this->makeOrder([
            'product_id' => $product->id,
            // 20.00 subtotal - 5.00 discount + 3.00 deployment fee = 18.00
            'total' => 18.00,
            'metadata' => [
                'discount_code' => 'SAVE5',
                'subtotal' => 20.00,
                'deployment_fee' => 3.00,
            ],
        ]);

        $invoice = $this->service->generate($order->fresh());
        $snapshot = $invoice->snapshot;

        $this->assertEquals(20.0, $snapshot['subtotal']);
        $this->assertEquals(5.0, $snapshot['discount_amount']);
        $this->assertEquals(3.0, $snapshot['deployment_fee']);
        $this->assertEquals(18.0, $snapshot['total']);

        $reconciled = array_sum(array_column($snapshot['line_items'], 'amount'));
        $this->assertEqualsWithDelta($snapshot['total'], $reconciled, 0.001);
    }

    public function testUuidIsAutoGeneratedWhenCreatingAnInvoiceWithoutOne(): void
    {
        $order = $this->makeOrder();

        // Regression guard: Invoice::booted() auto-generates a uuid in a
        // "creating" hook, but this base Model validates on "saving" — which
        // fires first. If 'uuid' were required in $validationRules, this
        // would throw a DataValidationException before the hook ever runs.
        $invoice = $order->invoice()->create([
            'disk' => 'local',
            'path' => "invoices/{$order->user_id}/manually-created.pdf",
        ]);

        $this->assertNotEmpty($invoice->uuid);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
            $invoice->uuid
        );
    }

    public function testEachOrderCanOnlyHaveOneInvoice(): void
    {
        $order = $this->makeOrder();

        $first = $this->service->generate($order->fresh());
        $order->refresh();

        $this->assertTrue($order->invoice()->exists());
        $this->assertSame($first->id, $order->invoice->id);
    }
}
