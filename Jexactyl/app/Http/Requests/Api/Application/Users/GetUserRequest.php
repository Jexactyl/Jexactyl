<?php

namespace Everest\Http\Requests\Api\Application\Users;

use Everest\Models\AdminRole;

class GetUserRequest extends GetUsersRequest
{
    public function permission(): string
    {
        return AdminRole::USERS_READ;
    }
}
