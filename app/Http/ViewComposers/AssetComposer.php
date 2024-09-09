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
            'auto_update' => boolval(config('app.auto_update', false)),
            'indicators' => boolval(config('app.indicators', false)),
            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],
        ]);
    }
}
