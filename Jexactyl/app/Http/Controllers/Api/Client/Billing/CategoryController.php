<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Billing\Category;
use Everest\Models\Billing\BillingException;
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

        if ($categories->count() == 0) {
            BillingException::create([
                'title' => 'No product categories are visible',
                'exception_type' => BillingException::TYPE_STOREFRONT,
                'description' => 'Create a category and set the visibility to true',
            ]);
        }

        return $this->fractal->collection($categories)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }
}
