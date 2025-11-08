<?php

namespace Everest\Http\Requests\Api\Application\Servers\Databases;

use Everest\Models\AdminRole;

class ServerDatabaseWriteRequest extends GetServerDatabasesRequest
{
    public function permission(): string
    {
        return AdminRole::SERVERS_UPDATE;
    }
}
