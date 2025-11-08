<?php

namespace Everest\Http\Requests\Api\Application\Databases;

use Everest\Models\AdminRole;

class GetDatabaseRequest extends GetDatabasesRequest
{
    public function permission(): string
    {
        return AdminRole::DATABASES_READ;
    }
}
