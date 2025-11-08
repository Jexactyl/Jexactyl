<?php

namespace Everest\Http\Requests\Api\Application\Roles;

use Everest\Models\AdminRole;

class UpdateRoleRequest extends StoreRoleRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? AdminRole::getRulesForUpdate($this->route()->parameter('role'));
    }

    public function permission(): string
    {
        return AdminRole::ROLES_UPDATE;
    }
}
