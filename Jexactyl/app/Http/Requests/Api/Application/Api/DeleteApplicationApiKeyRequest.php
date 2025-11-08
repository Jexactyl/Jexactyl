<?php

namespace Everest\Http\Requests\Api\Application\Api;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteApplicationApiKeysRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::API_DELETE;
    }
}
