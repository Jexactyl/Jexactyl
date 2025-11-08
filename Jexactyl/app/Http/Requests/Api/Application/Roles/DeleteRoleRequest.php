<?php

namespace Everest\Http\Requests\Api\Application\Roles;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteRoleRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::ROLES_DELETE;
    }
}
