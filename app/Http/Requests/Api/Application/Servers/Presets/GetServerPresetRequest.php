<?php

namespace Everest\Http\Requests\Api\Application\Servers\Presets;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetServerPresetRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::SERVER_PRESETS_READ;
    }
}
