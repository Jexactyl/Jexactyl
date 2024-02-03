<?php

namespace Everest\Http\Requests\Api\Application\Mounts;

use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class MountNodesRequest extends ApplicationApiRequest
{
    public function rules(array $rules = null): array
    {
        return $rules ?? ['nodes' => 'required|exists:nodes,id'];
    }
}
