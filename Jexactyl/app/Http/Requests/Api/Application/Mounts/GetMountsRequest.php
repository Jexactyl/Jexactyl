<?php

namespace Everest\Http\Requests\Api\Application\Mounts;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetMountsRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::MOUNTS_READ;
    }
}
