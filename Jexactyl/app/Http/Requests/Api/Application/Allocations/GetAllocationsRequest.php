<?php

namespace Everest\Http\Requests\Api\Application\Allocations;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetAllocationsRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::NODES_READ;
    }
}
