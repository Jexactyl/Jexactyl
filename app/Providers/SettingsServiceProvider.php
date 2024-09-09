<?php

namespace Everest\Providers;

use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Encryption\Encrypter;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * An array of configuration keys to override with database values
     * if they exist.
     */
    protected array $keys = [
        // Pterodactyl-specific keys
        'app:name',
        'app:locale',
        'app:indicators',
        'app:auto_update',
        'recaptcha:enabled',
        'recaptcha:secret_key',
        'recaptcha:website_key',
        'pterodactyl:guzzle:timeout',
        'pterodactyl:guzzle:connect_timeout',
        'pterodactyl:console:count',
        'pterodactyl:console:frequency',
        'pterodactyl:auth:2fa_required',
        'pterodactyl:client_features:allocations:enabled',
        'pterodactyl:client_features:allocations:range_start',
        'pterodactyl:client_features:allocations:range_end',

        // Authentication module settings
        'modules:auth:registration:enabled',
        'modules:auth:security:force2fa',
        'modules:auth:security:attempts',

        'modules:auth:discord:enabled',
        'modules:auth:discord:client_id',
        'modules:auth:discord:client_secret',

        'modules:auth:google:enabled',
        'modules:auth:google:client_id',
        'modules:auth:google:client_secret',

        'modules:auth:onboarding:enabled',
        'modules:auth:onboarding:content',

        'modules:auth:jguard:enabled',
        'modules:auth:jguard:delay',

        // Billing module settings
        'modules:billing:enabled',

        // Ticket module settings
        'modules:tickets:enabled',
        'modules:tickets:max_count',
    ];

    /**
     * Boot the service provider.
     */
    public function boot(ConfigRepository $config, Encrypter $encrypter, Log $log, SettingsRepositoryInterface $settings): void
    {
        try {
            $values = $settings->all()->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->value];
            })->toArray();
        } catch (QueryException $exception) {
            $log->notice('A query exception was encountered while trying to load settings from the database: ' . $exception->getMessage());

            return;
        }

        foreach ($this->keys as $key) {
            $value = array_get($values, 'settings::' . $key, $config->get(str_replace(':', '.', $key)));

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
