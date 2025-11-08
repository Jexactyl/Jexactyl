<?php

namespace Everest\Console\Commands\Billing;

use Everest\Models\Server;
use Illuminate\Console\Command;
use Everest\Services\Servers\SuspensionService;

class SuspendBillableServersCommand extends Command
{
    protected $description = 'An automated task to suspend and delete billable servers.';

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

                if ($daysOverdue > 7) {
                    $this->info("deleting server {$server->id}, overdue by {$daysOverdue} day(s)");
                    $server->delete();
                    continue;
                }

                if (!$server->suspended) {
                    $this->info("suspending server {$server->id}, overdue by {$daysOverdue} day(s)");
                    $this->suspend->toggle($server, 'suspend');
                }
            }
        }
    }
}
