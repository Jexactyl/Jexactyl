<?php

namespace Everest\Http\Requests\Api\Client\Servers\Subusers;

use Everest\Models\Permission;

class DeleteSubuserRequest extends SubuserRequest
{
    public function permission(): string
    {
        return Permission::ACTION_USER_DELETE;
    }
}
