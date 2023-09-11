<?php

namespace Jexactyl\Console\Commands\Schedule;

use Jexactyl\Models\Server;
use Illuminate\Console\Command;
use Jexactyl\Services\Analytics\AnalyticsReviewService;

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
