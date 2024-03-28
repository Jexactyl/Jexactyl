<?php

namespace Everest\Http\ViewComposers;

use Illuminate\View\View;

class AssetComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Everest',
            'locale' => config('app.locale') ?? 'en',
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'registration' => [
                'enabled' => boolval(config('modules.registration.enabled', false)),
            ],
            'security' => [
                'force2fa' => boolval(config('modules.security.force2fa', false)),
                'attempts' => config('modules.security.attempts', 3),
            ]
        ]);
    }
}
