<?php

namespace Jexactyl\Console\Commands\Overrides;

use Jexactyl\Console\RequiresDatabaseMigrations;
use Illuminate\Database\Console\Seeds\SeedCommand as BaseSeedCommand;

class SeedCommand extends BaseSeedCommand
{
    use RequiresDatabaseMigrations;

    /**
     * Block someone from running this seed command if they have not completed
     * the migration process.
     */
    public function handle(): int
    {
        if (!$this->hasCompletedMigrations()) {
            $this->showMigrationWarning();

            return 1;
        }

        return parent::handle();
    }
}
