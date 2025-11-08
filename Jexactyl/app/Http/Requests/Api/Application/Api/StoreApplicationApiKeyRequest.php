<?php

namespace Everest\Http\Requests\Api\Application\Api;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreApplicationApiKeyRequest extends ApplicationApiRequest
{
    public function getKeyPermissions(): array
    {
        $arr = [];

        foreach ($this->all()['permissions'] as $key => $value) {
            $arr[$key] = $value;
        }

        return $arr;
    }

    public function permission(): string
    {
        return AdminRole::API_CREATE;
    }
}
