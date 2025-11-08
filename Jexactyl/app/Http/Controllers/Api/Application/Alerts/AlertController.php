<?php

namespace Everest\Http\Controllers\Api\Application\Alerts;

use Ramsey\Uuid\Uuid;
use Everest\Models\Setting;
use Everest\Facades\Activity;
use Illuminate\Http\JsonResponse;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Alerts\UpdateAlertSettingsRequest;

class AlertController extends ApplicationApiController
{
    /**
     * AlertController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Update the general alert settings on the Panel.
     *
     * @throws \Throwable
     */
    public function update(UpdateAlertSettingsRequest $request): JsonResponse
    {
        $uuid = Uuid::uuid4()->toString();

        Setting::set('settings::modules:alert:uuid', $uuid);

        foreach ($request->normalize() as $key => $value) {
            Setting::set('settings::modules:alert:' . $key, $value);
        }

        Activity::event('admin:alert:update')
            ->property('settings', $request->all())
            ->description('Alert system was updated with new data')
            ->log();

        return new JsonResponse($uuid);
    }
}
