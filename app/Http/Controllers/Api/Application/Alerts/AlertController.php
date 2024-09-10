<?php

namespace Everest\Http\Controllers\Api\Application\Alerts;

use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Alerts\GeneralSettingsRequest;

class AlertController extends ApplicationApiController
{
    /**
     * AlertController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the general alert settings on the Panel.
     *
     * @throws \Throwable
     */
    public function update(GeneralSettingsRequest $request): Response
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::modules:alert:' . $key, $value);
        };

        return $this->returnNoContent();
    }
}
