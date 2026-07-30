<?php

namespace Everest\Services\Billing;

use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Invoice;
use Illuminate\Support\Facades\Storage;

class InvoiceGenerationService
{
    /**
     * Generate a PDF invoice for a processed order, storing it on disk and
     * recording an Invoice model pointing at it. Everything is built up front
     * (uuid, number, path) so this is a single insert — an order only ever
     * has one invoice, so the order id doubles as a stable invoice number.
     */
    public function generate(Order $order): Invoice
    {
        $uuid = (string) Str::uuid();
        $number = sprintf('INV-%06d', $order->id);
        $snapshot = $this->buildSnapshot($order, $number);

        $path = "invoices/{$order->user_id}/{$uuid}.pdf";
        $pdf = Pdf::loadView('invoices.pdf', ['snapshot' => $snapshot]);
        Storage::disk('local')->put($path, $pdf->output());

        return Invoice::create([
            'uuid' => $uuid,
            'order_id' => $order->id,
            'number' => $number,
            'disk' => 'local',
            'path' => $path,
            'snapshot' => $snapshot,
            'generated_at' => now(),
        ]);
    }

    /**
     * Freeze everything needed to render this order's invoice as of right now,
     * so later edits/deletions to the product, node, or egg don't affect it.
     */
    private function buildSnapshot(Order $order, string $number): array
    {
        $product = $order->product;
        $server = $order->server;
        $node = $server?->node;
        $egg = $server?->egg;
        $metadata = $order->metadata ?? [];

        $deploymentFee = (float) ($metadata['deployment_fee'] ?? 0);
        $discountCode = $metadata['discount_code'] ?? null;

        if ($discountCode && isset($metadata['subtotal'])) {
            // Pre-discount price, captured at checkout time since the live
            // product price may have since changed.
            $subtotal = (float) $metadata['subtotal'];
            $discountAmount = max(0, $subtotal - ($order->total - $deploymentFee));
        } else {
            // No discount was captured for this order, so fall back to what was
            // actually charged (guaranteed to reconcile with the total below)
            // rather than the product's current live price, which may have
            // changed since this order was placed.
            $subtotal = $order->total - $deploymentFee;
            $discountAmount = 0.0;
        }

        $lineItems = array_values(array_filter([
            $product ? [
                'description' => $product->name,
                'amount' => $subtotal,
            ] : null,
            $discountCode ? [
                'description' => "Discount ({$discountCode})",
                'amount' => -$discountAmount,
            ] : null,
            $deploymentFee > 0 ? [
                'description' => 'Deployment Fee (one-time)',
                'amount' => $deploymentFee,
            ] : null,
        ]));

        return [
            'invoice_number' => $number,
            'order_id' => $order->id,
            'order_uuid' => $order->name,
            'order_type' => $order->type,
            'issued_at' => $order->created_at->toIso8601String(),
            'expires_at' => $server?->renewal_date?->toIso8601String(),
            'billed_to' => [
                'username' => $order->user->username,
                'email' => $order->user->email,
            ],
            'product' => $product ? [
                'name' => $product->name,
                'cpu_limit' => $product->cpu_limit,
                'memory_limit' => $product->memory_limit,
                'disk_limit' => $product->disk_limit,
                'backup_limit' => $product->backup_limit,
                'database_limit' => $product->database_limit,
                'allocation_limit' => $product->allocation_limit,
            ] : null,
            'server' => $server ? [
                'name' => $server->name,
                'uuid' => $server->uuid,
            ] : null,
            'node' => $node ? [
                'name' => $node->name,
                'fqdn' => $node->fqdn,
            ] : null,
            'egg' => $egg ? [
                'name' => $egg->name,
            ] : null,
            'line_items' => $lineItems,
            'subtotal' => $subtotal,
            'deployment_fee' => $deploymentFee,
            'discount_code' => $discountCode,
            'discount_amount' => $discountAmount,
            'total' => $order->total,
            'currency' => [
                'code' => config('modules.billing.currency.code'),
                'symbol' => config('modules.billing.currency.symbol'),
            ],
        ];
    }
}
