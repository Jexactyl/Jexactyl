<?php

namespace Everest\Http\Requests\Api\Application\Api;

use Everest\Models\ApiKey;
use Illuminate\Http\Request;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreApplicationApiKeyRequest extends ApplicationApiRequest
{
    public function getKeyPermissions(): array
    {
        return (array) $this->all()['permissions'];
    }
}