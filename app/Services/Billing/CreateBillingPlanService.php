<?php

namespace Everest\Services\Billing;

use Everest\Models\Server;
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
    public function process(string $user, string $uuid, Product $product, ?Server $server = null, ?string $status = 'processing'): BillingPlan
    {
        $data = [
            'state' => $status ?? 'processing',
            'bill_date' => date('j'),
            'user_id' => (int) $user,
            'uuid' => $uuid,
            'name' => 'Billing Plan ' . substr($uuid, 0, 8),
            'price' => $product->price,
            'description' => $product->description,
            'cpu_limit' => $product->cpu_limit,
            'memory_limit' => $product->memory_limit,
            'disk_limit' => $product->disk_limit,
            'backup_limit' => $product->backup_limit,
            'database_limit' => $product->database_limit,
            'allocation_limit' => $product->allocation_limit,
        ];

        if ($server instanceof Server) {
            $data['server_id'] = $server->uuid;
        }

        return BillingPlan::create($data);
    }
}
