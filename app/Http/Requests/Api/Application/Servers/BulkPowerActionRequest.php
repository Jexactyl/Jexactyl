<?php

namespace Everest\Http\Requests\Api\Application\Servers;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class BulkPowerActionRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::SERVERS_UPDATE;
    }

    public function rules(): array
    {
        return [
            'action' => 'required|string|in:start,stop,restart,kill',
            'servers' => 'required|array|min:1',
            'servers.*' => 'integer|min:1|exists:servers,id',
        ];
    }
}
