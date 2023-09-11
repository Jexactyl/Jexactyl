<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Files;

use Jexactyl\Models\Permission;
use Jexactyl\Contracts\Http\ClientPermissionsRequest;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class PullFileRequest extends ClientApiRequest implements ClientPermissionsRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_CREATE;
    }

    public function rules(): array
    {
        return [
            'url' => 'sometimes|string|url',
            'directory' => 'nullable|string',
            'filename' => 'nullable|string',
            'use_header' => 'boolean',
            'foreground' => 'boolean',
        ];
    }
}
