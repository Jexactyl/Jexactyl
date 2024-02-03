<?php

namespace Everest\Http\Requests\Api\Client\Servers\Network;

use Everest\Models\Permission;
use Everest\Http\Requests\Api\Client\ClientApiRequest;

class NewAllocationRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_ALLOCATION_CREATE;
    }
}
