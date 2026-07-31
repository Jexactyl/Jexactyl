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

// Collision's Whoops handler throws on every reported error, including
// E_DEPRECATED. On PHP 8.5 that turns routine framework deprecation notices
// (e.g. Illuminate\Console\Command::parseVerbosity()'s null array offset)
// into fatal errors during migrate:fresh/db:seed below. Keep Whoops for real
// errors but stop it from treating deprecations as fatal.
$previousErrorHandler = set_error_handler(
    function (int $level, string $message, string $file = '', int $line = 0) use (&$previousErrorHandler) {
        if ($level === E_DEPRECATED || $level === E_USER_DEPRECATED) {
            return true;
        }

        return $previousErrorHandler !== null && $previousErrorHandler($level, $message, $file, $line);
    }
);

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
