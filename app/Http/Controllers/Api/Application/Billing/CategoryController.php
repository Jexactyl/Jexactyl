<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Ramsey\Uuid\Uuid;
use Everest\Models\Egg;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Everest\Models\Billing\Category;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Exceptions\DisplayException;
use Everest\Transformers\Api\Application\CategoryTransformer;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Billing\Categories\GetBillingCategoryRequest;
use Everest\Http\Requests\Api\Application\Billing\Categories\GetBillingCategoriesRequest;
use Everest\Http\Requests\Api\Application\Billing\Categories\StoreBillingCategoryRequest;
use Everest\Http\Requests\Api\Application\Billing\Categories\DeleteBillingCategoryRequest;
use Everest\Http\Requests\Api\Application\Billing\Categories\UpdateBillingCategoryRequest;

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
    public function index(GetBillingCategoriesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $categories = QueryBuilder::for(Category::query())
            ->allowedFilters(['id', 'name'])
            ->allowedSorts(['id', 'name', 'created_at', 'visible'])
            ->paginate($perPage);

        return $this->transform($categories, CategoryTransformer::class);
    }

    /**
     * Store a new product category in the database.
     */
    public function store(StoreBillingCategoryRequest $request): array
    {
        ['nest_id' => $nestId, 'egg_id' => $eggId] = $this->resolveNestAndEgg($request);

        try {
            $category = Category::create([
                'uuid' => Uuid::uuid4()->toString(),
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'description' => $request->input('description'),
                'visible' => $request->input('visible'),
                'nest_id' => $nestId,
                'egg_id' => $eggId,
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to create a new product category: ' . $ex->getMessage());
        }

        Activity::event('admin:billing:categories:create')
            ->subject($category)
            ->property('category', $category)
            ->description('A billing category was created')
            ->log();

        return $this->transform($category, CategoryTransformer::class);
    }

    /**
     * Update an existing category.
     */
    public function update(UpdateBillingCategoryRequest $request, Category $category): Response
    {
        ['nest_id' => $nestId, 'egg_id' => $eggId] = $this->resolveNestAndEgg($request);

        try {
            $category->updateOrFail([
                'name' => $request->input('name'),
                'icon' => $request->input('icon'),
                'description' => $request->input('description'),
                'visible' => $request->input('visible'),
                'nest_id' => $nestId,
                'egg_id' => $eggId,
            ]);
        } catch (\Exception $ex) {
            throw new \Exception('Failed to update a product category: ' . $ex->getMessage());
        }

        Activity::event('admin:billing:categories:update')
            ->subject($category)
            ->property('category', $category)
            ->property('new_data', $request->all())
            ->description('A billing category was updated')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * View an existing category.
     */
    public function view(GetBillingCategoryRequest $request, Category $category): array
    {
        return $this->transform($category, CategoryTransformer::class);
    }

    /**
     * Delete a category and the products linked to it.
     */
    public function delete(DeleteBillingCategoryRequest $request, Category $category): Response
    {
        DB::transaction(function () use ($category) {
            foreach ($category->products()->get() as $product) {
                $product->forceDelete();
            }

            $category->forceDelete();
        });

        Activity::event('admin:billing:categories:delete')
            ->subject($category)
            ->property('category', $category)
            ->description('A billing category was deleted')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Resolve the nest and egg a category should be scoped to. An egg is optional: when
     * one isn't provided, customers pick an egg from the nest themselves at checkout, so
     * only the nest is required.
     *
     * @return array{nest_id: int, egg_id: int|null}
     */
    private function resolveNestAndEgg(ApplicationApiRequest $request): array
    {
        $eggId = $request->input('eggId');

        if ($eggId) {
            $egg = Egg::query()->findOrFail($eggId);

            return ['nest_id' => $egg->nest_id, 'egg_id' => $egg->id];
        }

        $nestId = $request->input('nestId');

        if (!$nestId) {
            throw new DisplayException('Either an egg or a nest must be selected for this category.');
        }

        return ['nest_id' => (int) $nestId, 'egg_id' => null];
    }
}
