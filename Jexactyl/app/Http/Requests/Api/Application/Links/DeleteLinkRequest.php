<?php

namespace Everest\Http\Requests\Api\Application\Links;

use Everest\Models\AdminRole;
use Everest\Models\CustomLink;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteLinkRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::LINKS_DELETE;
    }
}
