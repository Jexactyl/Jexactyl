<?php

namespace Everest\Http\Requests\Api\Client\Servers\Files;

use Everest\Models\Permission;
use Everest\Http\Requests\Api\Client\ClientApiRequest;

class UploadFileRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_FILE_CREATE;
    }
}
