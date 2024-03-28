<?php

namespace Everest\Http\Requests\Api\Application\Api;

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
}
