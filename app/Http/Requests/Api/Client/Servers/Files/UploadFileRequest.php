<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Files;

use Jexactyl\Models\Permission;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class UploadFileRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_CREATE;
    }
}
