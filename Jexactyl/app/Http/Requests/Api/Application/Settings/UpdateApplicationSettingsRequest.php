<?php

namespace Everest\Http\Requests\Api\Application\Settings;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class UpdateApplicationSettingsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'app:name' => 'nullable|string|min:3|max:40',
            'app:logo' => 'nullable|url|max:255',
            'app:auto_update' => 'nullable|bool',
            'app:indicators' => 'nullable|bool',
            'app:speed_dial' => 'nullable|bool',

            'activity:enabled:account' => 'nullable|bool',
            'activity:enabled:server' => 'nullable|bool',
            'activity:enabled:admin' => 'nullable|bool',
        ];
    }

    public function permission(): string
    {
        return AdminRole::SETTINGS_UPDATE;
    }
}
