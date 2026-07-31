<?php

namespace Everest\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\Process\Process;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Process\PhpExecutableFinder;
use Everest\Services\Helpers\SoftwareVersionService;

class AutoUpdateCommand extends Command
{
    protected const DEFAULT_URL = 'https://github.com/jexactyl/jexactyl/releases/%s/panel.tar.gz';

    protected $signature = 'p:auto-update
        {--user= : The user that PHP runs under. All files will be owned by this user.}
        {--group= : The group that PHP runs under. All files will be owned by this group.}
        {--url= : The specific archive to download.}
        {--release= : A specific Jexpanel version to download from GitHub. Leave blank to use latest.}
        {--force : Perform the upgrade even if the current version is already the latest.}';

    protected $description = 'Downloads a new archive for Jexpanel from GitHub and then executes the normal upgrade commands.';

    /**
     * Executes an upgrade command which will run through all of our standard
     * commands for Jexpanel and enable users to basically just download
     * the archive and execute this and be done.
     *
     * @throws \Exception
     */
    public function handle()
    {
        Cache::forget(SoftwareVersionService::VERSION_CACHE_KEY);
        $versionService = $this->getLaravel()->make(SoftwareVersionService::class);

        if (!$this->option('force') && !$this->option('url') && !$this->option('release') && $versionService->isLatestPanel()) {
            $this->info("You are already running the latest version of Jexpanel ({$versionService->getCurrentVersion()}). Pass --force to update anyway.");

            return self::SUCCESS;
        }

        $user = $this->option('user') ?? 'www-data';
        $group = $this->option('group') ?? 'www-data';

        ini_set('output_buffering', '0');
        $bar = $this->output->createProgressBar(9);
        $bar->start();

        $this->withProgress($bar, function () {
            $this->line("\$upgrader> curl -L \"{$this->getUrl()}\" | tar -xzf -");

            $process = Process::fromShellCommandline("curl -L {$this->getUrl()} | tar -xzf -");
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan down');
            $this->call('down');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> chmod -R 755 storage bootstrap/cache');
            $process = new Process(['chmod', '-R', '755', 'storage', 'bootstrap/cache']);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () {
            $command = ['composer', 'install', '--no-ansi'];
            if (config('app.env') === 'production' && !config('app.debug')) {
                $command[] = '--optimize-autoloader';
                $command[] = '--no-dev';
            }

            $this->line('$upgrader> ' . implode(' ', $command));
            $process = new Process($command);
            $process->setTimeout(10 * 60);
            $process->run(function ($type, $buffer) {
                $this->line($buffer);
            });
        });

        // From here on, every remaining step must run as its own fresh PHP process rather
        // than in-process via $this->call(). Composer's autoloader (vendor/autoload.php)
        // was already loaded once when this command started, before "composer install"
        // above could have added or updated any packages; PHP never reloads an already
        // required file, so this process's autoloader permanently has no knowledge of
        // anything composer just changed on disk. Re-requiring bootstrap/app.php does not
        // fix this — it re-registers providers using the same stale autoloader, which then
        // throws "Class ... not found" for any newly added package. A fresh `php artisan`
        // invocation always builds its autoloader from the current state of vendor/, so it
        // doesn't have this problem.
        $phpBinary = (new PhpExecutableFinder())->find(false) ?: 'php';
        $artisan = $this->getLaravel()->basePath('artisan');

        $runArtisan = function (array $arguments) use ($phpBinary, $artisan) {
            $process = new Process([$phpBinary, $artisan, ...$arguments]);
            $process->setTimeout(5 * 60);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        };

        $this->withProgress($bar, function () use ($runArtisan) {
            $this->line('$upgrader> php artisan optimize:clear');
            $runArtisan(['optimize:clear']);
        });

        $this->withProgress($bar, function () use ($runArtisan) {
            $this->line('$upgrader> php artisan migrate --force --seed');
            $runArtisan(['migrate', '--force', '--seed']);
        });

        $this->withProgress($bar, function () use ($user, $group) {
            $this->line("\$upgrader> chown -R {$user}:{$group} *");
            $process = Process::fromShellCommandline("chown -R {$user}:{$group} *", $this->getLaravel()->basePath());
            $process->setTimeout(10 * 60);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () use ($runArtisan) {
            $this->line('$upgrader> php artisan queue:restart');
            $runArtisan(['queue:restart']);
        });

        $this->withProgress($bar, function () use ($runArtisan) {
            $this->line('$upgrader> php artisan up');
            $runArtisan(['up']);
        });

        $this->newLine(2);
        $this->info('Panel has been successfully updated to the latest version.');
    }

    protected function withProgress(ProgressBar $bar, \Closure $callback)
    {
        $bar->clear();
        $callback();
        $bar->advance();
        $bar->display();
    }

    protected function getUrl(): string
    {
        if ($this->option('url')) {
            return $this->option('url');
        }

        return sprintf(self::DEFAULT_URL, $this->option('release') ? 'download/v' . $this->option('release') : 'latest/download');
    }
}
