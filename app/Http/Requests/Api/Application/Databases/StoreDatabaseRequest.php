<?php

namespace Everest\Http\Requests\Api\Application\Databases;

use Everest\Models\DatabaseHost;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreDatabaseRequest extends ApplicationApiRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? DatabaseHost::getRules();
    }
}
