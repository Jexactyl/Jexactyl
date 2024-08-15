<?php

namespace Everest\Http\Controllers\Api\Application;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Services\Helpers\SoftwareVersionService;
use Everest\Contracts\Repository\SettingsRepositoryInterface;

class OverviewController extends ApplicationApiController
{
    /**
     * OverviewController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private SoftwareVersionService $softwareVersionService
    ) {
        parent::__construct();
    }

    /**
     * Returns version information.
     */
    public function version(): JsonResponse
    {
        return new JsonResponse($this->softwareVersionService->getVersionData());
    }

    /**
     * Update the overview ettings for the Panel.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set('settings::app:' . $request->input('key'), $request->input('value'));

        return $this->returnNoContent();
    }
}
