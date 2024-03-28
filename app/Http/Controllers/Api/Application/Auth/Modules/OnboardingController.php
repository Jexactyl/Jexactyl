<?php

namespace Everest\Http\Controllers\Api\Application\Auth\Modules;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class OnboardingController extends ApplicationApiController
{
    /**
     * OnboardingController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the Onboarding settings in the Panel.
     * Currently, it is only possible to update one value at once.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set(
            'settings::modules:auth:onboarding:' . $request->input('key'),
            $request->input('value')
        );

        return $this->returnNoContent();
    }
}
