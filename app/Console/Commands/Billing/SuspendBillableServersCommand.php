<?php

namespace Everest\Console\Commands\Billing;

use Everest\Models\Server;
use Illuminate\Console\Command;
use Everest\Services\Servers\SuspensionService;

class SuspendBillableServersCommand extends Command
{
    protected $description = 'An automated task to suspend billable servers with past renewal dates.';

    protected $signature = 'p:billing:suspend-billable-servers';

    /**
     * SuspendBillableServersCommand constructor.
     */
    public function __construct(private SuspensionService $suspend)
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle()
    {
        $now = now();

        foreach (Server::whereNotNull('billing_product_id')->get() as $server) {
            $renewalDate = $server->renewal_date;

            if ($renewalDate === null) {
                continue;
            }

            if ($renewalDate->isPast()) {
                $daysOverdue = $renewalDate->diffInDays($now);

                // Get the product to determine if it's free or paid
                $product = $server->product;

                // Determine suspension threshold based on whether server is free or paid
                $suspensionThreshold = 0;
                if ($product && (float) $product->price === 0.0) {
                    // Free server - use free suspension days
                    $suspensionThreshold = config('modules.billing.renewal.free_suspension_days', 7);
                } else {
                    // Paid server - use paid suspension days
                    $suspensionThreshold = config('modules.billing.renewal.paid_suspension_days', 30);
                }

                // Only suspend if overdue by more than the threshold
                if ($daysOverdue > $suspensionThreshold && !$server->isSuspended()) {
                    $this->info("suspending server {$server->id}, overdue by {$daysOverdue} day(s)");
                    $this->suspend->toggle($server, 'suspend');
                }
            }
        }
    }
}
