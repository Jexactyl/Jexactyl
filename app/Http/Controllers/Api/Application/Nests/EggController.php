<?php

namespace Jexactyl\Http\Controllers\Api\Application\Nests;

use Jexactyl\Models\Egg;
use Jexactyl\Models\Nest;
use Jexactyl\Transformers\Api\Application\EggTransformer;
use Jexactyl\Http\Requests\Api\Application\Nests\Eggs\GetEggRequest;
use Jexactyl\Http\Requests\Api\Application\Nests\Eggs\GetEggsRequest;
use Jexactyl\Http\Controllers\Api\Application\ApplicationApiController;

class EggController extends ApplicationApiController
{
    /**
     * Return all eggs that exist for a given nest.
     */
    public function index(GetEggsRequest $request, Nest $nest): array
    {
        return $this->fractal->collection($nest->eggs)
            ->transformWith($this->getTransformer(EggTransformer::class))
            ->toArray();
    }

    /**
     * Return a single egg that exists on the specified nest.
     */
    public function view(GetEggRequest $request, Nest $nest, Egg $egg): array
    {
        return $this->fractal->item($egg)
            ->transformWith($this->getTransformer(EggTransformer::class))
            ->toArray();
    }
}
