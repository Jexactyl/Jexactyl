<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Billing\Category;
use Everest\Transformers\Api\Client\CategoryTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class CategoryController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the categories that have been configured.
     */
    public function index(): array
    {
        $categories = Category::where('visible', true)->get();

        return $this->fractal->collection($categories)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }
}
