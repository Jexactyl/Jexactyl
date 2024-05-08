<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class BillingSettingsController extends ApplicationApiController
{
    /**
     * BillingSettingsController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Get the billing settings for the Panel.
     */
    public function view(): array
    {
        // TODO(jex): don't do this
        return [
            'enabled' => boolval($this->settings->get('settings::modules:billing:enabled')),
        ];
    }

    /**
     * Update the billing settings for the Panel.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set('settings::modules:billing:' . $request->input('key'), $request->input('value'));

        return $this->returnNoContent();
    }
}
