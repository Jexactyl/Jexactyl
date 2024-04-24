<?php

namespace Everest\Providers;

use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Everest\Contracts\Repository\ThemeRepositoryInterface;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class ThemeServiceProvider extends ServiceProvider
{
    /**
     * An array of configuration keys to override with database values
     * if they exist.
     */
    protected array $keys = [
        'colors:primary',
        'colors:secondary',

        'colors:background',
        'colors:headers',
        'colors:sidebar',
    ];

    /**
     * Boot the service provider.
     */
    public function boot(ConfigRepository $config, Log $log, ThemeRepositoryInterface $settings): void
    {
        try {
            $values = $settings->all()->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->value];
            })->toArray();
        } catch (QueryException $exception) {
            $log->notice('A query exception was encountered while trying to load theme configuration from the database: ' . $exception->getMessage());

            return;
        }

        foreach ($this->keys as $key) {
            $value = array_get($values, 'theme::' . $key, $config->get(str_replace(':', '.', $key)));

            switch (strtolower($value)) {
                case 'true':
                case '(true)':
                    $value = true;
                    break;
                case 'false':
                case '(false)':
                    $value = false;
                    break;
                case 'empty':
                case '(empty)':
                    $value = '';
                    break;
                case 'null':
                case '(null)':
                    $value = null;
            }

            $config->set(str_replace(':', '.', $key), $value);
        }
    }
}
