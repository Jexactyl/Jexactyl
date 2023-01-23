<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Files;

use Jexactyl\Models\Permission;
use Jexactyl\Contracts\Http\ClientPermissionsRequest;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class DeleteFileRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_DELETE;
    }

    public function rules(): array
    {
        return [
            'root' => 'required|nullable|string',
            'files' => 'required|array',
            'files.*' => 'string',
        ];
    }
}
