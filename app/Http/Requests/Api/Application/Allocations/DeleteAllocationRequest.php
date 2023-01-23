<?php

namespace Jexactyl\Http\Requests\Api\Application\Allocations;

use Jexactyl\Services\Acl\Api\AdminAcl;
use Jexactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteAllocationRequest extends ApplicationApiRequest
{
    protected ?string $resource = AdminAcl::RESOURCE_ALLOCATIONS;

    protected int $permission = AdminAcl::WRITE;
}
