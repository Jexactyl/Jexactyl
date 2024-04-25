<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Models\Billing\Category;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Transformers\Api\Application\CategoryTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class CategoryController extends ApplicationApiController
{
    /**
     * CategoryController constructor.
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

        $categories = QueryBuilder::for(Category::query())
            ->allowedFilters(['id', 'name'])
            ->allowedSorts(['id', 'name'])
            ->paginate($perPage);

        return $this->fractal->collection($categories)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }

    /**
     * Store a new product category in the database.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $category = Category::create([
                'uuid' => Uuid::uuid4()->toString(),
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'description' => $request->input('description'),
                'visible' => $request->input('visible'),
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to create a new product category: ' . $ex->getMessage());
        }

        return $this->fractal->item($category)
            ->transformWith(CategoryTransformer::class)
            ->respond(Response::HTTP_CREATED);
    }

    /**
     * Update an existing category.
     */
    public function update(Request $request, Category $category): Response
    {
        try {
            $category->updateOrFail([
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'description' => $request->input('description'),
                'visible' => $request->input('visible'),
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to update a product category: ' . $ex->getMessage());
        }

        return $this->returnNoContent();
    }

    /**
     * View an existing category.
     */
    public function view(Request $request, Category $category): array
    {
        return $this->fractal->item($category)
            ->transformWith(CategoryTransformer::class)
            ->toArray();
    }

    /**
     * Delete a category and the products linked to it.
     */
    public function delete(Request $request, Category $category): Response
    {
        foreach ($category->products() as $product) {
            $product->delete();
        };

        $category->delete();

        return $this->returnNoContent();
    }
}
