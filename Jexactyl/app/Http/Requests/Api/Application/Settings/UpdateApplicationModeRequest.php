<?php

namespace Everest\Http\Requests\Api\Application\Settings;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class UpdateApplicationModeRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'mode' => 'nullable|string|in:standard,personal',
        ];
    }

    public function permission(): string
    {
        return AdminRole::SETTINGS_UPDATE;
    }
}
