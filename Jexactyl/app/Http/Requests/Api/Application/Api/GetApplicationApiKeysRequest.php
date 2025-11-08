<?php

namespace Everest\Http\Requests\Api\Application\Api;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetApplicationApiKeysRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::API_READ;
    }
}
