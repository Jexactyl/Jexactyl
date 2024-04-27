<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\EggVariable;
use Everest\Transformers\Api\Client\EggVariableTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class EggController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the variables of an egg.
     */
    public function index(int $id): array
    {
        $variables = EggVariable::where('egg_id', $id)->get();

        return $this->fractal->collection($variables)
            ->transformWith(EggVariableTransformer::class)
            ->toArray();
    }
}
