<?php

namespace Everest\Http\Requests\Api\Application\Nodes;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetNodesRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::NODES_READ;
    }
}
