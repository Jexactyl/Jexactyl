<?php

namespace Jexactyl\Http\Requests\Api\Application\Users;

use Jexactyl\Services\Acl\Api\AdminAcl as Acl;
use Jexactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class GetUsersRequest extends ApplicationApiRequest
{
    protected ?string $resource = Acl::RESOURCE_USERS;

    protected int $permission = Acl::READ;
}
