<?php

namespace Everest\Http\Controllers\Api\Application\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class RegistrationController extends ApplicationApiController
{
    /**
     * RegistrationController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the general registration settings on the Panel.
     * Currently, it is only possible to update one value at once.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set(
            'settings::modules:auth:registration:' . $request->input('key'),
            $request->input('value')
        );

        return $this->returnNoContent();
    }
}
