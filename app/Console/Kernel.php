<?php

namespace Jexactyl\Console;

use Jexactyl\Models\ActivityLog;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Database\Console\PruneCommand;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Jexactyl\Console\Commands\Schedule\ProcessRunnableCommand;
use Jexactyl\Console\Commands\Maintenance\PruneOrphanedBackupsCommand;
use Jexactyl\Console\Commands\Maintenance\CleanServiceBackupFilesCommand;

class Kernel extends ConsoleKernel
{
    /**
     * Register the commands for the application.
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');
    }

    // Refer to: https://github.com/illuminate/console/blob/master/Scheduling/ManagesFrequencies.php
    // for time frequencies in terms of running commands, e.g. |->everyThirtyMinutes();|

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        // Execute scheduled commands for servers every minute, as if there was a normal cron running.
        $schedule->command(ProcessRunnableCommand::class)->everyMinute()->withoutOverlapping();
        $schedule->command(CleanServiceBackupFilesCommand::class)->daily();

        if (config('backups.prune_age')) {
            // Every 30 minutes, run the backup pruning command so that any abandoned backups can be deleted.
            $schedule->command(PruneOrphanedBackupsCommand::class)->everyThirtyMinutes();
        }

        // Run analysis commands to collect and process data.
        $schedule->command(AnalysisCollectionCommand::class)->everyFifteenMinutes();
        $schedule->command(AnalysisReviewCommand::class)->everyThreeHours();

        if (config('activity.prune_days')) {
            $schedule->command(PruneCommand::class, ['--model' => [ActivityLog::class]])->daily();
        }
    }
}
