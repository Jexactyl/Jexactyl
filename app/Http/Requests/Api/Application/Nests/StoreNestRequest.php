<?php

namespace Everest\Http\Requests\Api\Application\Nests;

use Everest\Models\Nest;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreNestRequest extends ApplicationApiRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? Nest::getRules();
    }
}
