<?php

namespace Jexactyl\Http\Requests\Api\Application\Servers\Databases;

use Jexactyl\Services\Acl\Api\AdminAcl;

class ServerDatabaseWriteRequest extends GetServerDatabasesRequest
{
    protected int $permission = AdminAcl::WRITE;
}
