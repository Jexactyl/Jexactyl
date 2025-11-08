<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Ramsey\Uuid\Uuid;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Transformers\Api\Application\ProductTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Billing\Products\GetBillingProductRequest;
use Everest\Http\Requests\Api\Application\Billing\Products\GetBillingProductsRequest;
use Everest\Http\Requests\Api\Application\Billing\Products\StoreBillingProductRequest;
use Everest\Http\Requests\Api\Application\Billing\Products\DeleteBillingProductRequest;
use Everest\Http\Requests\Api\Application\Billing\Products\UpdateBillingProductRequest;

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
    public function index(GetBillingProductsRequest $request, int $id): array
    {
        $category = Category::findOrFail($id);

        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $products = QueryBuilder::for(Product::query())
            ->where('category_uuid', $category->uuid)
            ->allowedFilters(['id', 'name'])
            ->allowedSorts(['id', 'name', 'price'])
            ->paginate($perPage);

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Store a new product category in the database.
     */
    public function store(StoreBillingProductRequest $request, Category $category): JsonResponse
    {
        // TODO(jex): clean this up, make a service or somethin'
        try {
            $product = Product::create([
                'uuid' => Uuid::uuid4()->toString(),
                'category_uuid' => $category->uuid,
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'price' => (float) $request->input('price'),
                'description' => $request->input('description'),
                'cpu_limit' => $request['limits']['cpu'],
                'memory_limit' => $request['limits']['memory'],
                'disk_limit' => $request['limits']['disk'],
                'backup_limit' => $request['limits']['backup'],
                'database_limit' => $request['limits']['database'],
                'allocation_limit' => $request['limits']['allocation'],
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to create a new product: ' . $ex->getMessage());
        }

        Activity::event('admin:billing:products:create')
            ->property('product', $product)
            ->description('A new billing product was created')
            ->log();

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->respond(Response::HTTP_CREATED);
    }

    /**
     * Update an existing product.
     */
    public function update(UpdateBillingProductRequest $request, Category $category, int $productId): Response
    {
        $product = Product::findOrFail($productId);

        try {
            $product->update([
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'price' => (float) $request->input('price'),
                'description' => $request->input('description'),
                'cpu_limit' => $request['limits']['cpu'],
                'memory_limit' => $request['limits']['memory'],
                'disk_limit' => $request['limits']['disk'],
                'backup_limit' => $request['limits']['backup'],
                'database_limit' => $request['limits']['database'],
                'allocation_limit' => $request['limits']['allocation'],
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to update a product: ' . $ex->getMessage());
        }

        Activity::event('admin:billing:products:update')
            ->property('product', $product)
            ->property('new_data', $request->all())
            ->description('A billing product has been updated')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * View an existing product.
     */
    public function view(GetBillingProductRequest $request, Category $category, int $productId): array
    {
        $product = Product::findOrFail($productId);

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Delete a product.
     */
    public function delete(DeleteBillingProductRequest $request, Category $category, int $productId): Response
    {
        $product = Product::findOrFail($productId);

        $product->delete();

        Activity::event('admin:billing:products:delete')
            ->property('product', $product)
            ->description('A billing product has been deleted')
            ->log();

        return $this->returnNoContent();
    }
}
