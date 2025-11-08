<?php

namespace Everest\Providers;

use Illuminate\Support\Arr;
use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Everest\Contracts\Repository\ThemeRepositoryInterface;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class ThemeServiceProvider extends ServiceProvider
{
    protected array $keys = [
        'colors:primary',
        'colors:secondary',
        'colors:background',
        'colors:headers',
        'colors:sidebar',
    ];

    protected array $map = [
        'true' => true,   '(true)' => true,
        'false' => false,  '(false)' => false,
        'empty' => '',     '(empty)' => '',
        '1' => 1,      '0' => 0,
        'null' => null,   '(null)' => null,
    ];

    public function boot(ConfigRepository $config, Log $log, ThemeRepositoryInterface $settings): void
    {
        try {
            $values = $settings->all()
                ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
                ->toArray();
        } catch (QueryException $exception) {
            $log->notice(
                'A query exception was encountered while trying to load theme configuration from the database: ' .
                $exception->getMessage()
            );

            return;
        }

        foreach ($this->keys as $key) {
            $dotKey = str_replace(':', '.', $key);

            $value = Arr::get($values, 'theme::' . $key, $config->get($dotKey));

            $lower = is_string($value) ? strtolower($value) : $value;

            if (is_string($lower) && array_key_exists($lower, $this->map)) {
                $value = $this->map[$lower];
            }

            $config->set($dotKey, $value);
        }
    }
}
