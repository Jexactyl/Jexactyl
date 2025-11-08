<?php

namespace Everest\Http\Requests\Api\Application\Users;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetExternalUserRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::USERS_READ;
    }
}
