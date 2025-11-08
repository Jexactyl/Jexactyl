<?php

namespace Everest\Http\Requests\Api\Application\Databases;

use Everest\Models\AdminRole;
use Everest\Models\DatabaseHost;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreDatabaseRequest extends ApplicationApiRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? DatabaseHost::getRules();
    }

    public function permission(): string
    {
        return AdminRole::DATABASES_CREATE;
    }
}
