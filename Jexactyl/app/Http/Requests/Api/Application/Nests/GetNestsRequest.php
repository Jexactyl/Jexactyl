<?php

namespace Everest\Http\Requests\Api\Application\Nests;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetNestsRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::NESTS_READ;
    }
}
