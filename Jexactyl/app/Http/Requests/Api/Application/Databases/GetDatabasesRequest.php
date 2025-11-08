<?php

namespace Everest\Http\Requests\Api\Application\Databases;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetDatabasesRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::DATABASES_READ;
    }
}
