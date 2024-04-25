<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Transformers\Api\Application\ProductTransformer;
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
    public function index(Request $request, int $id): array
    {
        $perPage = (int) $request->query('per_page', '10');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $products = QueryBuilder::for(Product::query())
            ->where('category_id', $id)
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
    public function store(Request $request, Category $category): JsonResponse
    {
        // TODO(jex): clean this up, make a service or somethin'
        try {
            $product = Product::create([
                'uuid' => Uuid::uuid4()->toString(),
                'category_id' => $category->id,
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'price' => (double) $request->input('price'),
                'description' => $request->input('description'),
                'cpu_limit' => $request['limits']['cpu'],
                'memory_limit' => $request['limits']['memory'],
                'disk_limit' =>  $request['limits']['disk'],
                'backup_limit' => $request['limits']['backup'],
                'database_limit' => $request['limits']['database'],
                'allocation_limit' => $request['limits']['allocation'],
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to create a new product: ' . $ex->getMessage());
        }

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->respond(Response::HTTP_CREATED);
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Category $category, Product $product): Response
    {
        try {
            $product->update([
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'price' => (double) $request->input('price'),
                'description' => $request->input('description'),
                'cpu_limit' => $request['limits']['cpu'],
                'memory_limit' => $request['limits']['memory'],
                'disk_limit' =>  $request['limits']['disk'],
                'backup_limit' => $request['limits']['backup'],
                'database_limit' => $request['limits']['database'],
                'allocation_limit' => $request['limits']['allocation'],
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to update a product: ' . $ex->getMessage());
        }

        return $this->returnNoContent();
    }

    /**
     * View an existing product.
     */
    public function view(Request $request, Category $category, Product $product): array
    {
        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Delete a product.
     */
    public function delete(Request $request, Category $category, Product $product): Response
    {
        $product->delete();

        return $this->returnNoContent();
    }
}
