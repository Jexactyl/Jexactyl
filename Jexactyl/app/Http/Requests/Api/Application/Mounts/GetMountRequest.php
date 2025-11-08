<?php

namespace Everest\Http\Requests\Api\Application\Mounts;

use Everest\Models\AdminRole;

class GetMountRequest extends GetMountsRequest
{
    public function permission(): string
    {
        return AdminRole::MOUNTS_READ;
    }
}
