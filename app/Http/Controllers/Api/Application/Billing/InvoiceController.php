<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Everest\Models\Billing\Invoice;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Everest\Transformers\Api\Application\InvoiceTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Billing\Invoices\GetBillingInvoicesRequest;

class InvoiceController extends ApplicationApiController
{
    /**
     * InvoiceController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all invoices.
     */
    public function index(GetBillingInvoicesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $invoices = QueryBuilder::for(Invoice::with('order.user'))
            ->allowedFilters([
                AllowedFilter::partial('number'),
                AllowedFilter::callback('user', function ($query, $value) {
                    $query->whereHas('order.user', function ($query) use ($value) {
                        $query->where('username', 'like', "%{$value}%")
                            ->orWhere('email', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::callback('status', function ($query, $value) {
                    $query->whereHas('order', function ($query) use ($value) {
                        $query->where('status', $value);
                    });
                }),
            ])
            ->allowedSorts(['id', 'number', 'generated_at', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->transform($invoices, InvoiceTransformer::class);
    }

    /**
     * Download the generated PDF for an invoice.
     */
    public function download(GetBillingInvoicesRequest $request, Invoice $invoice): StreamedResponse
    {
        return Storage::disk($invoice->disk)->download($invoice->path, "{$invoice->number}.pdf");
    }
}
