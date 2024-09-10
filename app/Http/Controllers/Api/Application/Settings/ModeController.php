<?php

namespace Everest\Http\Controllers\Api\Application\Settings;

use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Settings\ModeSettingsRequest;

class ModeController extends ApplicationApiController
{
    /**
     * ModeController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the selected Panel mode.
     *
     * @throws \Throwable
     */
    public function update(ModeSettingsRequest $request): Response
    {
        $this->settings->set('settings::app:mode', $request->all()[0]);

        return $this->returnNoContent();
    }
}
