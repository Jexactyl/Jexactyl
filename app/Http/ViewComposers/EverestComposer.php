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
            ],
        ]);
    }
}
