<?php

namespace Everest\Http\Requests\Api\Application\Mounts;

use Everest\Models\Mount;
use Everest\Models\AdminRole;

class UpdateMountRequest extends StoreMountRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? Mount::getRulesForUpdate($this->route()->parameter('mount'));
    }

    public function permission(): string
    {
        return AdminRole::MOUNTS_UPDATE;
    }
}
