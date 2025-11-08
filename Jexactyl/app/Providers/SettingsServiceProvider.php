<?php

namespace Everest\Providers;

use Illuminate\Support\Arr;
use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Encryption\Encrypter;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class SettingsServiceProvider extends ServiceProvider
{
    protected array $keys = [
        // Jexactyl-specific keys
        'app:name', 'app:logo', 'app:mode', 'app:setup', 'app:locale',
        'app:speed_dial', 'app:indicators', 'app:auto_update',
        'recaptcha:enabled', 'recaptcha:secret_key', 'recaptcha:website_key',
        'pterodactyl:guzzle:timeout', 'pterodactyl:guzzle:connect_timeout',
        'pterodactyl:console:count', 'pterodactyl:console:frequency',
        'pterodactyl:auth:2fa_required',
        'pterodactyl:client_features:allocations:enabled',
        'pterodactyl:client_features:allocations:range_start',
        'pterodactyl:client_features:allocations:range_end',
        'activity:enabled:account',
        'activity:enabled:server',
        'activity:enabled:admin',        

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
        'modules:billing:paypal',
        'modules:billing:link',
        'modules:billing:keys:publishable',
        'modules:billing:keys:secret',
        'modules:billing:currency:code',
        'modules:billing:currency:symbol',
        'modules:billing:links:terms',
        'modules:billing:links:privacy',

        // Ticket module settings
        'modules:tickets:enabled',
        'modules:tickets:max_count',

        // Alert module settings
        'modules:alert:enabled',
        'modules:alert:type',
        'modules:alert:position',
        'modules:alert:content',
        'modules:alert:uuid',

        // AI module settings
        'modules:ai:enabled',
        'modules:ai:key',
        'modules:ai:user_access',

        // Webhook module settings
        'modules:webhooks:enabled',
        'modules:webhooks:url',
    ];

    /**
     * Map of string → typed values.
     */
    protected array $map = [
        'true' => true,   '(true)' => true,
        'false' => false,  '(false)' => false,
        'empty' => '',     '(empty)' => '',
        '1' => 1,      '0' => 0,
        'null' => null,   '(null)' => null,
    ];

    public function boot(
        ConfigRepository $config,
        Encrypter $encrypter,
        Log $log,
        SettingsRepositoryInterface $settings
    ): void {
        try {
            $values = $settings->all()
                ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
                ->toArray();
        } catch (QueryException $exception) {
            $log->notice(
                'A query exception was encountered while trying to load settings from the database: ' .
                $exception->getMessage()
            );

            return;
        }

        foreach ($this->keys as $key) {
            $dotKey = str_replace(':', '.', $key);

            $value = Arr::get($values, 'settings::' . $key, $config->get($dotKey));

            $lower = is_string($value) ? strtolower($value) : $value;

            if (is_string($lower) && array_key_exists($lower, $this->map)) {
                $value = $this->map[$lower];
            }

            $config->set($dotKey, $value);
        }
    }
}
