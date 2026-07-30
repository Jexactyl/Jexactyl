<?php

namespace Everest\Tests\Integration\Console\Commands\Billing;

use Everest\Models\Billing\Order;
use Illuminate\Support\Facades\Queue;
use Everest\Jobs\Billing\GenerateInvoiceJob;
use Everest\Tests\Traits\Integration\CreatesBillingTestModels;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class GenerateInvoicesCommandTest extends ClientApiIntegrationTestCase
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

    public function testItQueuesInvoiceGenerationOnlyForProcessedOrdersWithoutAnInvoice(): void
    {
        Queue::fake();

        $needsInvoice = $this->makeOrder(['status' => Order::STATUS_PROCESSED]);
        $pending = $this->makeOrder(['status' => Order::STATUS_PENDING]);
        $failed = $this->makeOrder(['status' => Order::STATUS_FAILED]);
        $expired = $this->makeOrder(['status' => Order::STATUS_EXPIRED]);

        $alreadyInvoiced = $this->makeOrder(['status' => Order::STATUS_PROCESSED]);
        // Deliberately omits 'uuid' to also exercise the model's auto-generation
        // hook (regression guard: it must run early enough to satisfy the base
        // Model's saving-time validation, which historically it did not).
        $alreadyInvoiced->invoice()->create([
            'disk' => 'local',
            'path' => "invoices/{$alreadyInvoiced->user_id}/already-generated.pdf",
        ]);

        $this->artisan('p:billing:generate-invoices')->assertExitCode(0);

        Queue::assertPushed(GenerateInvoiceJob::class, 1);
        Queue::assertPushed(GenerateInvoiceJob::class, function (GenerateInvoiceJob $job) use ($needsInvoice) {
            return $job->order->is($needsInvoice);
        });

        Queue::assertNotPushed(GenerateInvoiceJob::class, function (GenerateInvoiceJob $job) use ($pending) {
            return $job->order->is($pending);
        });
        Queue::assertNotPushed(GenerateInvoiceJob::class, function (GenerateInvoiceJob $job) use ($failed) {
            return $job->order->is($failed);
        });
        Queue::assertNotPushed(GenerateInvoiceJob::class, function (GenerateInvoiceJob $job) use ($expired) {
            return $job->order->is($expired);
        });
        Queue::assertNotPushed(GenerateInvoiceJob::class, function (GenerateInvoiceJob $job) use ($alreadyInvoiced) {
            return $job->order->is($alreadyInvoiced);
        });
    }

    public function testItQueuesNothingWhenThereIsNoWorkToDo(): void
    {
        Queue::fake();

        $this->artisan('p:billing:generate-invoices')->assertExitCode(0);

        Queue::assertNotPushed(GenerateInvoiceJob::class);
    }
}
