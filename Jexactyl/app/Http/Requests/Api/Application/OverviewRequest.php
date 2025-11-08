<?php

namespace Everest\Http\Requests\Api\Application;

use Everest\Models\AdminRole;

class OverviewRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::OVERVIEW_READ;
    }
}
