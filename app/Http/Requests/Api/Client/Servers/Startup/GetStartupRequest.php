<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Startup;

use Jexactyl\Models\Permission;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class GetStartupRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_STARTUP_READ;
    }
}
