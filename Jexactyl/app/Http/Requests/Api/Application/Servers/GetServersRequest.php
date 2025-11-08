<?php

namespace Everest\Http\Requests\Api\Application\Servers;

use Everest\Models\AdminRole;

class GetServersRequest extends GetServerRequest
{
    public function rules(): array
    {
        return [
            'search' => 'string|max:100',
        ];
    }

    public function permission(): string
    {
        return AdminRole::SERVERS_READ;
    }
}
