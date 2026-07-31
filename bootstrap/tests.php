<?php

use Illuminate\Support\Str;
use NunoMaduro\Collision\Provider;
use Illuminate\Contracts\Console\Kernel;
use Symfony\Component\Console\Output\ConsoleOutput;

require __DIR__ . '/../vendor/autoload.php';

$envFile = file_exists(__DIR__ . '/../.env.ci') ? '.env.ci' : '.env';
Dotenv\Dotenv::createImmutable(__DIR__ . '/../', $envFile)->safeLoad();

$app = require __DIR__ . '/app.php';

/** @var Everest\Console\Kernel $kernel */
$kernel = $app->make(Kernel::class);

/*
 * Bootstrap the kernel and prepare application for testing.
 */
$kernel->bootstrap();

// Register the collision service provider so that errors during the test
// setup process are output nicely.
(new Provider())->register();

$output = new ConsoleOutput();

$prefix = 'database.connections.' . config('database.default');
if (!Str::contains(config("$prefix.database"), 'test')) {
    $output->writeln(PHP_EOL . '<error>Cannot run test process against non-testing database.</error>');
    $output->writeln(PHP_EOL . '<error>Environment is currently pointed at: "' . config("$prefix.database") . '".</error>');
    exit(1);
}

/*
 * Perform database migrations and reseeding before continuing with
 * running the tests.
 */
if (!env('SKIP_MIGRATIONS')) {
    $output->writeln(PHP_EOL . '<info>Refreshing database for Integration tests...</info>');
    $kernel->call('migrate:fresh');

    $output->writeln('<info>Seeding database for Integration tests...</info>' . PHP_EOL);
    $kernel->call('db:seed');

    $output->writeln('<info>Database configured, running Integration tests...</info>' . PHP_EOL);
} else {
    $output->writeln(PHP_EOL . '<comment>Skipping database migrations...</comment>' . PHP_EOL);
}

// The kernel bootstrap above (and the artisan commands run against it) registers
// global error/exception handlers via Illuminate's HandleExceptions bootstrapper
// and Collision's provider. Laravel's own test lifecycle unconditionally drains
// the *entire* handler stack after every test (see HandleExceptions::flushState),
// so any handlers left over from this one-time setup would make every single
// test appear to have "removed error handlers other than its own". Flush now so
// PHPUnit's per-test snapshot starts from a clean baseline.
Illuminate\Foundation\Bootstrap\HandleExceptions::flushState();
