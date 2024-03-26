<?php

namespace Everest\Http\Controllers\Api\Application\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class GeneralController extends ApplicationApiController
{
    /**
     * GeneralController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the general settings on the Panel.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set('settings::app:name', $request->input('appName'));

        return $this->returnNoContent();
    }
}
