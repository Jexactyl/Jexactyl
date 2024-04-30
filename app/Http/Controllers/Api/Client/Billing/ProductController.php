<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Illuminate\Http\Request;
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

    /**
     * View a specific product.
     */
    public function view(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        return $request->user()
            ->newSubscription('default', $product->stripe_id)
            ->checkout([
                'success_url' => route('index'),
                'cancel_url' => route('index'),
            ]);
    }
}
