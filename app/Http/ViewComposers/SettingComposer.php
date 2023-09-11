<?php

namespace Jexactyl\Http\ViewComposers;

use Illuminate\View\View;
use Jexactyl\Services\Helpers\AssetHashService;

class SettingComposer extends Composer
{
    /**
     * AssetComposer constructor.
     */
    public function __construct(private AssetHashService $assetHashService)
    {
        parent::__construct();
    }

    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {
        $view->with('asset', $this->assetHashService);

        $view->with('siteConfiguration', [
            'name' => config('app.name') ?? 'Jexactyl',
            'locale' => config('app.locale') ?? 'en',
            'logo' => config('app.logo'),
            'background' => config('theme.user.background'),

            'recaptcha' => [
                'enabled' => config('recaptcha.enabled', false),
                'siteKey' => config('recaptcha.website_key') ?? '',
            ],

            'alert' => [
                'type' => $this->setting('alert:type', Composer::TYPE_STR),
                'message' => $this->setting('alert:message', Composer::TYPE_STR),
            ],

            'registration' => [
                'email' => $this->setting('registration:enabled', Composer::TYPE_BOOL),
                'discord' => $this->setting('discord:enabled', Composer::TYPE_BOOL),
            ],

            'approvals' => $this->setting('approvals:enabled', Composer::TYPE_BOOL),
            'tickets' => $this->setting('tickets:enabled', Composer::TYPE_BOOL),
            'coupons' => $this->setting('coupons:enabled', Composer::TYPE_BOOL),
            'databases' => $this->getDatabaseAvailability(),
        ]);
    }
}
