<?php

namespace Everest\Http\Requests\Api\Application\Intelligence;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class UpdateIntelligenceSettingsRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'enabled' => 'nullable|bool',
            'api_key' => 'nullable|string',
            'key' => 'nullable|string', // Legacy support
            'endpoint' => 'nullable|string|url',
            'model' => 'nullable|string',
            'max_tokens' => 'nullable|integer|min:1|max:4000',
            'temperature' => 'nullable|numeric|min:0|max:1',
            'user_access' => 'nullable|bool',
        ];
    }

    public function permission(): string
    {
        return AdminRole::AI_UPDATE;
    }
}
