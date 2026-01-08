<?php

namespace Everest\Http\Requests\Api\Application\Servers\Presets;

use Everest\Models\AdminRole;
use Everest\Models\ServerPreset;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreServerPresetRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return ServerPreset::rules();
    }

    public function permission(): string
    {
        return AdminRole::SERVER_PRESETS_CREATE;
    }
}
