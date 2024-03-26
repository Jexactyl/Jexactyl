<?php

namespace Everest\Http\Controllers\Api\Application\Settings;

use Illuminate\Http\Response;
use Everest\Contracts\Repository\SettingsRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Settings\UpdateMailSettingsRequest;

class MailController extends ApplicationApiController
{
    /**
     * MailController constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the mail settings on the Panel.
     *
     * @throws \Throwable
     */
    public function update(UpdateMailSettingsRequest $request): Response
    {
        if (config('mail.default') !== 'smtp') {
            throw new \Exception('This feature is only available if SMTP is the selected email driver for the Panel.');
        }

        // TODO(jex): Mail settings update

        return $this->returnNoContent();
    }
}
