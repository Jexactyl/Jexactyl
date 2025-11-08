<?php

namespace Everest\Http\Requests\Api\Application\Links;

use Everest\Models\AdminRole;
use Everest\Models\CustomLink;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreLinkRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return CustomLink::rules();
    }

    public function permission(): string
    {
        return AdminRole::LINKS_CREATE;
    }
}
