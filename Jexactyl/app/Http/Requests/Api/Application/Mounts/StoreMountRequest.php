<?php

namespace Everest\Http\Requests\Api\Application\Mounts;

use Everest\Models\Mount;
use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreMountRequest extends ApplicationApiRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? Mount::getRules();
    }

    public function permission(): string
    {
        return AdminRole::MOUNTS_CREATE;
    }
}
