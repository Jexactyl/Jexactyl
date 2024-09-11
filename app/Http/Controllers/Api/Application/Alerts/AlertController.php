<?php

namespace Everest\Http\Controllers\Api\Application\Alerts;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\JsonResponse;
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
    public function update(GeneralSettingsRequest $request): JsonResponse
    {
        $uuid = Uuid::uuid4()->toString();

        $this->settings->set('settings::modules:alert:uuid', $uuid);

        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::modules:alert:' . $key, $value);
        };

        return new JsonResponse($uuid);
    }
}
