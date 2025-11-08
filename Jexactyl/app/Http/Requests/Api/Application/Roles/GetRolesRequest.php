<?php

namespace Everest\Http\Requests\Api\Application\Roles;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetRolesRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::ROLES_READ;
    }
}
