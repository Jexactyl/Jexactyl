<?php

namespace Jexactyl\Console\Commands\Schedule;

use Jexactyl\Models\Server;
use Illuminate\Console\Command;
use Jexactyl\Models\AnalyticsData;
use Jexactyl\Repositories\Wings\DaemonServerRepository;

class AnalyticsCollectionCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'p:schedule:analytics';

    /**
     * @var string
     */
    protected $description = 'Collect analytics on server performance.';

    /**
     * AnalyticsCollectionCommand constructor.
     */
    public function __construct(private DaemonServerRepository $repository)
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle()
    {
        foreach (Server::all() as $server) {
            $this->line($server->id . ' is being processed');

            $stats = $this->repository->setServer($server)->getDetails();
            $usage = $stats['utilization'];

            if ($stats['state'] === 'offline') {
                $this->line($server->id . ' is offline, skipping');
                continue;
            }

            if (AnalyticsData::where('server_id', $server->id)->count() >= 6) {
                $this->line($server->id . ' exceeds 6 entries, deleting oldest');
                AnalyticsData::where('server_id', $server->id)->orderBy('created_at', 'asc')->first()->delete();
            }

            try {
                AnalyticsData::create([
                    'server_id' => $server->id,
                    'cpu' => $usage['cpu_absolute'] / ($server->cpu / 100),
                    'memory' => ($usage['memory_bytes'] / 1024) / $server->memory / 10,
                    'disk' => ($usage['disk_bytes'] / 1024) / $server->disk / 10,
                ]);

                $this->line($server->id . ' analytics have been saved to database');
            } catch (\Exception $ex) {
                $this->error($server->id . ' failed to write stats: ' . $ex->getMessage());
            }
        }
    }
}
