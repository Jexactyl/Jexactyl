<?php

namespace Everest\Services\Billing;

use Ramsey\Uuid\Uuid;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\BillingPlan;

class CreateBillingPlanService
{
    /**
     * CreateBillingPlanService constructor.
     */
    public function __construct()
    {
    }

    /**
     * Process the creation of a server.
     */
    public function process(Request $request, Product $product, ?Server $server, ?string $status): BillingPlan
    {
        $uuid = Uuid::uuid4()->toString();

        BillingPlan::create([
            'state' => $status ?? 'processing',
            'bill_date' => date('j'),
            'user_id' => $request->user()->id,
            'server_id' => $server->id ?? -1,
            'uuid' => $uuid,
            'name' => 'Plan ' . substr($uuid, 0, 8),
            'price' => $product->price,
            'description' => $product->description,
            'cpu_limit' => $product->cpu_limit,
            'memory_limit' => $product->memory_limit,
            'disk_limit' => $product->disk_limit,
            'backup_limit' => $product->backup_limit,
            'database_limit' => $product->database_limit,
            'allocation_limit' => $product->allocation_limit,
        ]);
    }
}
