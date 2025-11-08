<?php

namespace Everest\Http\Requests\Api\Application\Roles;

use Everest\Models\AdminRole;

class GetRoleRequest extends GetRolesRequest
{
    public function permission(): string
    {
        return AdminRole::ROLES_READ;
    }
}
