<?php

namespace Everest\Http\Requests\Api\Application\Settings;

use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GeneralSettingsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'name' => 'nullable|string|min:3|max:40',
            'auto_update' => 'nullable|bool',
            'indicators' => 'nullable|bool',
            'speed_dial' => 'nullable|bool',
        ];
    }
}