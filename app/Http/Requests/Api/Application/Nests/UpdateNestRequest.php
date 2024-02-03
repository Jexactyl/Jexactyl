<?php

namespace Everest\Http\Requests\Api\Application\Nests;

use Everest\Models\Nest;

class UpdateNestRequest extends StoreNestRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? Nest::getRulesForUpdate($this->route()->parameter('nest'));
    }
}
