<?php

namespace Everest\Http\Requests\Api\Application\Nests;

use Everest\Models\Nest;
use Everest\Models\AdminRole;

class UpdateNestRequest extends StoreNestRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? Nest::getRulesForUpdate($this->route()->parameter('nest'));
    }

    public function permission(): string
    {
        return AdminRole::NESTS_UPDATE;
    }
}
