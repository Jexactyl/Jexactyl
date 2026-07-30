<?php

namespace Everest\Console\Commands;

use Everest\Console\Kernel;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\Console\Helper\ProgressBar;
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
        if (version_compare(PHP_VERSION, '8.2.0') < 0) {
            $this->error('Cannot execute automatic update process. The minimum required PHP version required is 8.2.0, you have [' . PHP_VERSION . '].');

            return self::FAILURE;
        }

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

        /** @var \Illuminate\Foundation\Application $app */
        $app = require __DIR__ . '/../../../bootstrap/app.php';
        /** @var Kernel $kernel */
        $kernel = $app->make(Kernel::class);
        $kernel->bootstrap();
        $this->setLaravel($app);

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan optimize:clear');
            $this->call('optimize:clear');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan migrate --force --seed');
            $this->call('migrate', ['--force' => true, '--seed' => true]);
        });

        $this->withProgress($bar, function () use ($user, $group) {
            $this->line("\$upgrader> chown -R {$user}:{$group} *");
            $process = Process::fromShellCommandline("chown -R {$user}:{$group} *", $this->getLaravel()->basePath());
            $process->setTimeout(10 * 60);
            $process->run(function ($type, $buffer) {
                $this->{$type === Process::ERR ? 'error' : 'line'}($buffer);
            });
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan queue:restart');
            $this->call('queue:restart');
        });

        $this->withProgress($bar, function () {
            $this->line('$upgrader> php artisan up');
            $this->call('up');
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
