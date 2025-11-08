<?php

namespace Everest\Http\Requests\Api\Application\Nodes;

use Everest\Models\AdminRole;

class GetNodeRequest extends GetNodesRequest
{
    public function permission(): string
    {
        return AdminRole::NODES_READ;
    }
}
