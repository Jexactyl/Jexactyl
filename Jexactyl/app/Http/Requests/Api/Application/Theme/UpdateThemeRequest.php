<?php

namespace Everest\Http\Requests\Api\Application\Theme;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class UpdateThemeRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::SETTINGS_UPDATE;
    }
}
