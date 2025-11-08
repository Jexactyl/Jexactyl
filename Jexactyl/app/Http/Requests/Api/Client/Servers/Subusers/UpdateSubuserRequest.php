<?php

namespace Everest\Http\Requests\Api\Client\Servers\Subusers;

use Everest\Models\Permission;

class UpdateSubuserRequest extends SubuserRequest
{
    public function permission(): string
    {
        return Permission::ACTION_USER_UPDATE;
    }

    public function rules(): array
    {
        return [
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ];
    }
}
