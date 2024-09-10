<?php

namespace Everest\Http\Requests\Api\Application\Settings;

use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class ModeSettingsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'mode' => 'nullable|string|in:standard,personal',
        ];
    }
}
