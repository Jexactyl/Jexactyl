<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Billing\Category;
use League\Fractal\Resource\Collection;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class CategoryTransformer extends Transformer
{
    /**
     * List of resources that can be included.
     */
    protected array $availableIncludes = [
        'products',
    ];

    /**
     * {@inheritdoc}
     */
    public function getResourceName(): string
    {
        return Category::RESOURCE_NAME;
    }

    /**
     * Transform this model into a representation that can be consumed by a client.
     */
    public function transform(Category $model): array
    {
        return [
            'id' => $model->id,
            'uuid' => $model->uuid,
            'name' => $model->name,
            'icon' => $model->icon,
            'description' => $model->description,
            'visible' => boolval($model->visible),
            'nest_id' => $model->nest_id,
            'egg_id' => $model->egg_id,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String() ? $model->updated_at->toIso8601String() : null,
        ];
    }

    /**
     * Return a generic array with product information.
     */
    public function includeProducts(Category $category): Collection|NullResource
    {
        return $this->collection($category->products, new ProductTransformer());
    }
}
