<?php

namespace Everest\Http\Requests\Api\Application\Eggs;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class ExportEggRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::EGGS_EXPORT;
    }
}
