<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Subusers;

use Jexactyl\Models\Permission;

class DeleteSubuserRequest extends SubuserRequest
{
    public function permission(): string
    {
        return Permission::ACTION_USER_DELETE;
    }
}
