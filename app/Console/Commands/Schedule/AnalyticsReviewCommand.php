<?php

namespace Pterodactyl\Console\Commands\Schedule;

use Pterodactyl\Models\Server;
use Illuminate\Console\Command;
use Pterodactyl\Services\Analytics\AnalyticsReviewService;

class AnalyticsReviewCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'p:schedule:analytics-review';

    /**
     * @var string
     */
    protected $description = 'Reviews server analytics and creates messages for servers.';

    /**
     * AnalyticsReviewCommand constructor.
     */
    public function __construct(private AnalyticsReviewService $reviewService)
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle()
    {
        foreach (Server::all() as $server) {
            $this->reviewService->handle($server);
        }
    }
}
