<?php

namespace Everest\Tests\Integration\Jobs\Billing;

use Illuminate\Support\Facades\Storage;
use Everest\Jobs\Billing\GenerateInvoiceJob;
use Everest\Models\Billing\BillingException;
use Everest\Services\Billing\InvoiceGenerationService;
use Everest\Tests\Traits\Integration\CreatesBillingTestModels;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class GenerateInvoiceJobTest extends ClientApiIntegrationTestCase
{
    use CreatesBillingTestModels;

    public function setUp(): void
    {
        parent::setUp();

        $this->enableBilling();
        Storage::fake('local');
    }

    protected function tearDown(): void
    {
        $this->cleanupBillingModels();

        parent::tearDown();
    }

    public function testHandleGeneratesAnInvoiceForTheOrder(): void
    {
        $order = $this->makeOrder();

        $job = new GenerateInvoiceJob($order);
        $job->handle($this->app->make(InvoiceGenerationService::class));

        $order->refresh();
        $this->assertTrue($order->invoice()->exists());
        Storage::disk('local')->assertExists($order->invoice->path);
    }

    public function testHandleIsIdempotentWhenAnInvoiceAlreadyExists(): void
    {
        $order = $this->makeOrder();
        $this->app->make(InvoiceGenerationService::class)->generate($order->fresh());

        $this->assertSame(1, $order->fresh()->invoice()->count());

        // Simulate the scheduled scan dispatching a second job for the same order
        // before the first has a chance to be recorded (e.g. a slow first run).
        $job = new GenerateInvoiceJob($order->fresh());
        $job->handle($this->app->make(InvoiceGenerationService::class));

        $this->assertSame(1, $order->fresh()->invoice()->count());
    }

    public function testHandleRecordsABillingExceptionAndRethrowsOnFailure(): void
    {
        $order = $this->makeOrder();

        $service = \Mockery::mock(InvoiceGenerationService::class);
        $service->shouldReceive('generate')->once()->andThrow(new \RuntimeException('dompdf exploded'));

        $job = new GenerateInvoiceJob($order);

        try {
            $job->handle($service);
            $this->fail('Expected exception was not thrown.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('dompdf exploded', $exception->getMessage());
        }

        $this->assertFalse($order->invoice()->exists());

        $billingException = BillingException::where('order_id', $order->id)
            ->where('exception_type', BillingException::TYPE_INVOICE)
            ->first();

        $this->assertNotNull($billingException);
        $this->assertSame('Failed to generate invoice', $billingException->title);
        $this->assertSame('dompdf exploded', $billingException->description);
    }
}
