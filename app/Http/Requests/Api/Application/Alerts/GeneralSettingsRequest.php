<?php

namespace Everest\Http\Requests\Api\Application\Alerts;

use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GeneralSettingsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'enabled' => 'nullable|bool',
            'type' => 'nullable|string|in:success,info,warning,danger',
            'position' => 'nullable|string|in:top-center,bottom-right,bottom-left,center',
            'content' => 'nullable|string|min:3|max:300',
        ];
    }
}