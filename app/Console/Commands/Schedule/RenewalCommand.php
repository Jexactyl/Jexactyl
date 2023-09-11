<?php

namespace Jexactyl\Console\Commands\Schedule;

use Jexactyl\Models\Server;
use Illuminate\Console\Command;
use Jexactyl\Services\Servers\SuspensionService;
use Jexactyl\Services\Servers\ServerDeletionService;

class RenewalCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'p:schedule:renewal';

    /**
     * @var string
     */
    protected $description = 'Process renewals for servers.';

    /**
     * DeleteUserCommand constructor.
     */
    public function __construct(
        private SuspensionService $suspensionService,
        private ServerDeletionService $deletionService
    ) {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle(Server $server)
    {
        $this->line('Executing daily renewal script.');
        $this->process($server);
        $this->line('Renewals completed successfully.');
    }

    /**
     * Takes one day off of the time a server has until it needs to be
     * renewed.
     */
    protected function process(Server $server)
    {
        $servers = $server->where('renewable', true)->get();
        $this->line('Processing renewals for ' . $servers->count() . ' servers.');

        foreach ($servers as $svr) {
            $this->line('Renewing server ' . $svr->name, false);

            $svr->update(['renewal' => $svr->renewal - 1]);

            if ($svr->renewal <= 0) {
                $this->line('Suspending server ' . $svr->name, false);
                $this->suspensionService->toggle($svr, 'suspend');
            }

            if ($svr->renewal <= -7) {
                $this->line('Deleting server ' . $svr->name, false);
                $this->deletionService->handle($svr);
            }
        }
    }
}
