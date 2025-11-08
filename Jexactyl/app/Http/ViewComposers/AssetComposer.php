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
            'logo' => config('app.logo') ?? null,
            'mode' => config('app.mode') ?? 'standard',
            'setup' => config('app.setup') ?? false,
            'debug' => env('APP_DEBUG') ?? false,
            'locale' => config('app.locale') ?? 'en',
            'auto_update' => boolval(config('app.auto_update', false)),
            'speed_dial' => boolval(config('app.speed_dial', false)),
            'indicators' => boolval(config('app.indicators', false)),
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
            'activity' => [
                'enabled' => [
                    'account' => config('activity.enabled.account', true),
                    'server' => config('activity.enabled.server', true),
                    'admin' => config('activity.enabled.admin', true),
                ]
            ]
        ]);
    }
}
