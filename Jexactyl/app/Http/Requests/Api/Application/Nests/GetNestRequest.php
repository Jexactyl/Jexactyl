<?php

namespace Everest\Http\Requests\Api\Application\Nests;

use Everest\Models\AdminRole;

class GetNestRequest extends GetNestsRequest
{
    public function permission(): string
    {
        return AdminRole::NESTS_READ;
    }
}
