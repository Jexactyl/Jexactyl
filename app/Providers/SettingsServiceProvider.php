<?php

namespace Everest\Providers;

use Illuminate\Support\Arr;
use Psr\Log\LoggerInterface as Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\ServiceProvider;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class SettingsServiceProvider extends ServiceProvider
{
    protected array $keys = [
        // Jexactyl-specific keys
        'app:name'
                => 'string', 
        'app:logo'
                => 'string', 
        'app:mode'
                => 'string', 
        'app:setup'
                => 'bool', 
        'app:locale'
                => "string",
        'app:speed_dial'
                => 'bool', 
        'app:indicators'
                => 'bool', 
        'app:auto_update'
                => 'bool',
        'recaptcha:enabled'
                => 'bool', 
        'recaptcha:secret_key'
                => 'string', 
        'recaptcha:website_key'
                => 'string',
        'pterodactyl:guzzle:timeout'
                => 'int', 
        'pterodactyl:guzzle:connect_timeout'
                => 'int',
        'pterodactyl:console:count'
                => 'int', 
        'pterodactyl:console:frequency'
                => 'int',
        'pterodactyl:auth:2fa_required'
                => 'bool',
        'pterodactyl:client_features:allocations:enabled'
                => 'bool',
        'pterodactyl:client_features:allocations:range_start'
                => 'tolerant',
        'pterodactyl:client_features:allocations:range_end'
                => 'tolerant',
        'activity:enabled:account'
                => 'bool',
        'activity:enabled:server'
                => 'bool',
        'activity:enabled:admin'
                => 'bool',

        // Authentication module settings
        'modules:auth:registration:enabled'
                => 'bool',
        'modules:auth:security:force2fa'
                => 'bool',
        'modules:auth:security:attempts'
                => 'int',

        'modules:auth:discord:enabled'
                => 'bool',
        'modules:auth:discord:client_id'
                => 'string',
        'modules:auth:discord:client_secret'
                => 'string',

        'modules:auth:google:enabled'
                => 'bool',
        'modules:auth:google:client_id'
                => 'string',
        'modules:auth:google:client_secret'
                => 'string',

        'modules:auth:onboarding:enabled'
                => 'bool',
        'modules:auth:onboarding:content'
                => 'string',

        'modules:auth:jguard:enabled'
                => 'bool',
        'modules:auth:jguard:delay'
                => 'int',
        'modules:auth:jguard:sensitivity'
                => 'string',

        // Billing module settings
        'modules:billing:enabled'
                => 'bool',
        'modules:billing:keys:secret'
                => 'string',
        'modules:billing:currency:code'
                => 'string',
        'modules:billing:currency:symbol'
                => 'string',
        'modules:billing:links:terms'
                => 'string',
        'modules:billing:links:privacy'
                => 'string',
        'modules:billing:renewal:days'
                => 'int',
        'modules:billing:renewal:threshold'
                => 'int',
        'modules:billing:allow_upgrades'
                => 'bool',

        // Ticket module settings
        'modules:tickets:enabled'
                => 'bool',
        'modules:tickets:max_count'
                => 'int',

        // Alert module settings
        'modules:alert:enabled'
                => 'bool',
        'modules:alert:type'
                => 'string',
        'modules:alert:position'
                => 'string',
        'modules:alert:content'
                => 'string',
        'modules:alert:uuid'
                => 'string',

        // AI module settings
        'modules:ai:enabled'
                => 'bool',
        'modules:ai:key'
                => 'string',
        'modules:ai:user_access'
                => 'bool',

        // Webhook module settings
        'modules:webhooks:enabled'
                => 'bool',
        'modules:webhooks:url'
                => 'string',
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
        Log $log,
        SettingsRepositoryInterface $settings,
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
            } elseif ($type !== "tolerant" && (get_debug_type($value) !== $type && gettype($value) !== $type)) {
                $value = is_bool($value) ? ($value ? 1 : 0) : $value;
                $value = !is_string($value) ? json_encode($value) : $value;
                settype($value, $type);
            }

            $config->set($dotKey, $value);
        }
    }
}
