<?php

namespace Everest\Http\Requests\Api\Application\Links;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetLinksRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::LINKS_READ;
    }
}
