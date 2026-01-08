<?php

namespace Everest\Http\ViewComposers;

use Illuminate\View\View;

class EverestComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('everestConfiguration', [
            'auth' => [
                'registration' => [
                    'enabled' => boolval(config('modules.auth.registration.enabled', false)),
                ],
                'security' => [
                    'force2fa' => boolval(config('modules.auth.security.force2fa', false)),
                    'attempts' => config('modules.auth.security.attempts', 3),
                ],
                'modules' => [
                    'discord' => [
                        'enabled' => boolval(config('modules.auth.discord.enabled', false)),
                        'clientId' => !empty(config('modules.auth.discord.client_id')),
                        'clientSecret' => !empty(config('modules.auth.discord.client_secret')),
                    ],
                    'google' => [
                        'enabled' => boolval(config('modules.auth.google.enabled', false)),
                        'clientId' => !empty(config('modules.auth.google.client_id', false)),
                        'clientSecret' => !empty(config('modules.auth.google.client_secret')),
                    ],
                    'onboarding' => [
                        'enabled' => boolval(config('modules.auth.onboarding.enabled', false)),
                        'content' => config('modules.auth.onboarding.content', ''),
                    ],
                    'jguard' => [
                        'enabled' => boolval(config('modules.auth.jguard.enabled', false)),
                    ],
                ],
            ],
            'tickets' => [
                'enabled' => boolval(config('modules.tickets.enabled', false)),
                'maxCount' => config('modules.tickets.max_count', 3),
            ],
            'billing' => [
                'enabled' => boolval(config('modules.billing.enabled', false)),
                'paypal' => config('modules.billing.paypal'),
                'link' => config('modules.billing.link'),
                'keys' => [
                    'publishable' => boolval(config('modules.billing.keys.publishable')),
                    'secret' => boolval(config('modules.billing.keys.secret')),
                ],
                'currency' => [
                    'symbol' => config('modules.billing.currency.symbol'),
                    'code' => config('modules.billing.currency.code'),
                ],
                'links' => [
                    'terms' => config('modules.billing.links.terms'),
                    'privacy' => config('modules.billing.links.privacy'),
                ],
                'renewal' => [
                    'days' => config('modules.billing.renewal.days', 30),
                    'free_renewal_days' => config('modules.billing.renewal.free_renewal_days', 30),
                    'suspension_threshold' => config('modules.billing.renewal.suspension_threshold', 7),
                    'free_suspension_days' => config('modules.billing.renewal.free_suspension_days', 7),
                    'paid_suspension_days' => config('modules.billing.renewal.paid_suspension_days', 30),
                ],
            ],
            'alert' => [
                'enabled' => boolval(config('modules.alert.enabled', false)),
                'type' => config('modules.alert.type'),
                'position' => config('modules.alert.position'),
                'content' => config('modules.alert.content'),
                'uuid' => config('modules.alert.uuid'),
            ],
            'ai' => [
                'enabled' => boolval(config('modules.ai.enabled', false)),
                'api_key' => config('modules.ai.api_key', ''),
                'key' => config('modules.ai.key', ''), // Legacy support \ Please remove this in the future if not needed
                'endpoint' => config('modules.ai.endpoint', 'https://api.openai.com/v1/chat/completions'),
                'model' => config('modules.ai.model', 'gpt-3.5-turbo'),
                'max_tokens' => config('modules.ai.max_tokens', 1000),
                'temperature' => config('modules.ai.temperature', 0.7),
                'user_access' => boolval(config('modules.ai.user_access', false)),
            ],
            'webhooks' => [
                'enabled' => boolval(config('modules.webhooks.enabled', false)),
                'url' => !empty(config('modules.webhooks.url')),
            ],
        ]);
    }
}
