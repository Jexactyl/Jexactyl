<?php

namespace Jexactyl\Http\Requests\Api\Application\Nests;

use Jexactyl\Services\Acl\Api\AdminAcl;
use Jexactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class GetNestsRequest extends ApplicationApiRequest
{
    protected ?string $resource = AdminAcl::RESOURCE_NESTS;

    protected int $permission = AdminAcl::READ;
}
