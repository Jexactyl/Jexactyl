<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Databases;

use Jexactyl\Models\Permission;
use Jexactyl\Contracts\Http\ClientPermissionsRequest;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class GetDatabasesRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_DATABASE_READ;
    }
}
