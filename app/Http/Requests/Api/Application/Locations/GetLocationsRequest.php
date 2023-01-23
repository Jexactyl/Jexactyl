<?php

namespace Jexactyl\Http\Requests\Api\Application\Locations;

use Jexactyl\Services\Acl\Api\AdminAcl;
use Jexactyl\Http\Requests\Api\Application\ApplicationApiRequest;

class GetLocationsRequest extends ApplicationApiRequest
{
    protected ?string $resource = AdminAcl::RESOURCE_LOCATIONS;

    protected int $permission = AdminAcl::READ;
}
