<?php

namespace Everest\Http\Requests\Api\Application;

use Everest\Models\AdminRole;

class ActivityRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::ACTIVITY_READ;
    }
}
