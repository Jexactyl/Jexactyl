<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Billing\Product;
use Everest\Transformers\Api\Client\ProductTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class ProductController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the products that have been configured.
     */
    public function index(int $id): array
    {
        $products = Product::where('category_id', $id)->get();

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }
}
