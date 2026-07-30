<?php

namespace Everest\Jobs\Billing;

use Everest\Jobs\Job;
use Everest\Models\Billing\Order;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Everest\Models\Billing\BillingException;
use Illuminate\Queue\Attributes\WithoutRelations;
use Everest\Services\Billing\InvoiceGenerationService;

class GenerateInvoiceJob extends Job implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use SerializesModels;

    public int $tries = 3;

    public function __construct(
        #[WithoutRelations]
        public readonly Order $order,
    ) {
        $this->queue = 'standard';
    }

    public function handle(InvoiceGenerationService $service): void
    {
        // The scheduled scan that dispatches this job can outpace a slow-running
        // job on a previous run; bail out rather than generate a duplicate invoice.
        if ($this->order->invoice()->exists()) {
            return;
        }

        try {
            $service->generate($this->order);
        } catch (\Throwable $e) {
            BillingException::create([
                'order_id' => $this->order->id,
                'exception_type' => BillingException::TYPE_INVOICE,
                'title' => 'Failed to generate invoice',
                'description' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
