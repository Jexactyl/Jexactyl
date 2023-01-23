<?php

namespace Jexactyl\Console\Commands\Schedule;

use Jexactyl\Models\Server;
use Illuminate\Console\Command;
use Jexactyl\Services\Servers\ServerDeletionService;

class PruneCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'p:schedule:prune';

    /**
     * @var string
     */
    protected $description = 'Delete all suspended servers.';

    /**
     * DeleteUserCommand constructor.
     */
    public function __construct(private ServerDeletionService $deletionService)
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle(Server $server)
    {
        $this->line('Running server prune...');
        $this->process($server);
        $this->line('Script completed successfully.');
    }

    /**
     * Takes one day off of the time a server has until it needs to be
     * renewed.
     */
    protected function process(Server $server)
    {
        $servers = $server->where('renewable', true)->get();
        $this->line('Processing renewals for ' . $servers->count() . ' servers.');

        foreach ($servers as $s) {
            $this->line('Processing server ' . $s->name . ', ID: ' . $s->id, false);

            if ($s->isSuspended()) {
                $this->line('Deleting server ' . $s->name, false);
                $this->deletionService->withForce(true)->returnResources(true)->handle($s);
            }
        }
    }
}
