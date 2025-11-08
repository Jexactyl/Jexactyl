<?php

namespace Everest\Http\Requests\Api\Application\Eggs;

use Everest\Models\AdminRole;

class GetEggRequest extends GetEggsRequest
{
    public function permission(): string
    {
        return AdminRole::EGGS_READ;
    }
}
