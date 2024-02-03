<?php

namespace Everest\Http\Requests\Api\Application\Eggs;

use Everest\Models\Egg;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteEggRequest extends ApplicationApiRequest
{
    public function resourceExists(): bool
    {
        $egg = $this->route()->parameter('egg');

        return $egg instanceof Egg && $egg->exists;
    }
}
