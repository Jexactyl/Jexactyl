<?php

namespace Everest\Tests\Integration\Api\Client\Billing;

use Everest\Models\User;
use Illuminate\Support\Facades\Storage;
use Everest\Services\Billing\InvoiceGenerationService;
use Everest\Tests\Traits\Integration\CreatesBillingTestModels;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class OrderControllerTest extends ClientApiIntegrationTestCase
{
    use CreatesBillingTestModels;

    public function setUp(): void
    {
        parent::setUp();

        $this->enableBilling();
    }

    protected function tearDown(): void
    {
        $this->cleanupBillingModels();

        parent::tearDown();
    }

    public function testIndexIncludesMetadataAndInvoiceRelationship(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $order = $this->makeOrder([
            'user_id' => $user->id,
            'metadata' => ['deployment_fee' => 5.50],
        ]);
        $invoice = $this->app->make(InvoiceGenerationService::class)->generate($order->fresh());

        $response = $this->actingAs($user)
            ->getJson('/api/client/billing/orders?include=server,invoice')
            ->assertOk();

        $response->assertJsonPath('data.0.attributes.metadata.deployment_fee', 5.50);
        $response->assertJsonPath('data.0.attributes.relationships.invoice.attributes.id', $invoice->id);
        $response->assertJsonPath('data.0.attributes.relationships.invoice.attributes.number', $invoice->number);
    }

    public function testViewIncludesMetadata(): void
    {
        $user = User::factory()->create();
        $order = $this->makeOrder([
            'user_id' => $user->id,
            'metadata' => ['discount_code' => 'SAVE5', 'subtotal' => 25.50],
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/client/billing/orders/{$order->id}")
            ->assertOk();

        $response->assertJsonPath('attributes.metadata.discount_code', 'SAVE5');
        $response->assertJsonPath('attributes.metadata.subtotal', 25.50);
    }

    public function testUserCannotViewAnotherUsersOrder(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $order = $this->makeOrder(['user_id' => $owner->id]);

        $this->actingAs($intruder)
            ->getJson("/api/client/billing/orders/{$order->id}")
            ->assertStatus(400);
    }

    public function testDownloadingAnInvoiceThatHasNotBeenGeneratedYetFails(): void
    {
        $user = User::factory()->create();
        $order = $this->makeOrder(['user_id' => $user->id]);

        $this->actingAs($user)
            ->getJson("/api/client/billing/orders/{$order->id}/invoice")
            ->assertStatus(400);
    }

    public function testUserCanDownloadTheirOwnGeneratedInvoice(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $order = $this->makeOrder(['user_id' => $user->id]);
        $invoice = $this->app->make(InvoiceGenerationService::class)->generate($order->fresh());

        $response = $this->actingAs($user)->get("/api/client/billing/orders/{$order->id}/invoice");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString($invoice->number, $response->headers->get('Content-Disposition'));

        $this->assertActivityFor('user:billing:order.invoice-download', $user, $order);
    }

    public function testUserCannotDownloadAnotherUsersInvoice(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $order = $this->makeOrder(['user_id' => $owner->id]);
        $this->app->make(InvoiceGenerationService::class)->generate($order->fresh());

        $this->actingAs($intruder)
            ->getJson("/api/client/billing/orders/{$order->id}/invoice")
            ->assertStatus(400);
    }
}
