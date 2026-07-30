<?php

namespace Everest\Tests\Integration\Transformers\Api\Client;

use Carbon\Carbon;
use Everest\Tests\TestCase;
use Everest\Models\Billing\Invoice;
use Everest\Transformers\Api\Client\InvoiceTransformer;

/**
 * Lives under Integration (not Unit) despite not touching the database: this
 * transformer's constructor resolves the request out of the Laravel container,
 * which only stays bootstrapped when the test extends the Laravel-aware base
 * TestCase, per-test createApplication() cycle.
 */
class InvoiceTransformerTest extends TestCase
{
    public function testItTransformsAnInvoiceWithoutExposingThePdfPathOrSnapshot(): void
    {
        $generatedAt = Carbon::parse('2026-01-15T10:00:00Z');

        $invoice = new Invoice();
        $invoice->id = 42;
        $invoice->number = 'INV-000042';
        $invoice->generated_at = $generatedAt;
        $invoice->path = 'invoices/1/secret-uuid.pdf';
        $invoice->disk = 'local';

        $result = (new InvoiceTransformer())->transform($invoice);

        $this->assertSame([
            'id' => 42,
            'number' => 'INV-000042',
            'generated_at' => $generatedAt->toIso8601String(),
        ], $result);
    }

    public function testGeneratedAtIsNullWhenNotYetSet(): void
    {
        $invoice = new Invoice();
        $invoice->id = 1;
        $invoice->number = null;

        $result = (new InvoiceTransformer())->transform($invoice);

        $this->assertNull($result['generated_at']);
    }
}
