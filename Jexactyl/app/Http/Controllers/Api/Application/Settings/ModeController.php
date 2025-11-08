<?php

namespace Everest\Http\Controllers\Api\Application\Settings;

use Everest\Models\Setting;
use Illuminate\Http\Response;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Settings\UpdateApplicationModeRequest;

class ModeController extends ApplicationApiController
{
    /**
     * ModeController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Update the selected Panel mode.
     *
     * @throws \Throwable
     */
    public function update(UpdateApplicationModeRequest $request): Response
    {
        Setting::set('settings::app:mode', $request['mode']);

        return $this->returnNoContent();
    }
}
