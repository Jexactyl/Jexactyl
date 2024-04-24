<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Models\Billing\Product;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Transformers\Api\Application\CategoryTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class ProductController extends ApplicationApiController
{
    /**
     * ProductController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get all categories associated with the panel.
     */
    public function index(Request $request): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $products = QueryBuilder::for(Product::query())
            ->where('category_id', $request->input('categoryId'))
            ->allowedFilters(['id', 'name'])
            ->allowedSorts(['id', 'name'])
            ->paginate($perPage);

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Store a new product category in the database.
     */
    public function store(Request $request): Response
    {
        try {
            Product::create([
                'uuid' => Uuid::uuid4()->toString(),
                'category_id' => $request->input('categoryId'),
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'price' => $request->input('price'),
                'description' => $request->input('description'),
                'cpu_limit' => $request->input('cpuLimit'),
                'memory_limit' => $request->input('memoryLimit'),
                'disk_limit' =>  $request->input('diskLimit'),
                'backup_limit' => $request->input('backupLimit'),
                'database_limit' => $request->input('databaseLimit'),
                'allocation_limit' => $request->input('allocationLimit'),
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to create a new product: ' . $ex->getMessage());
        }

        return $this->returnNoContent();
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request): Response
    {
        try {
            //
        } catch (\Exception $ex) {
            throw new \Exception('Failed to update a product category: ' . $ex->getMessage());
        }

        return $this->returnNoContent();
    }

    /**
     * View an existing product.
     */
    public function view(Request $request, Product $product): array
    {
        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Delete a product.
     */
    public function delete(Request $request, Product $product): Response
    {
        $product->delete();

        return $this->returnNoContent();
    }
}
