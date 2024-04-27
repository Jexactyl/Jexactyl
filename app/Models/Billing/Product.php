<?php

namespace Everest\Models\Billing;

use Everest\Models\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $uuid
 * @property int $category_id
 * @property string $name
 * @property string $icon
 * @property float $price
 * @property string $description
 * @property int $cpu_limit
 * @property int $memory_limit
 * @property int $disk_limit
 * @property int $backup_limit
 * @property int $database_limit
 * @property int $allocation_limit
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Product extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'product';

    /**
     * The table associated with the model.
     */
    protected $table = 'products';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'uuid', 'category_id', 'name', 'icon',
        'price', 'description', 'cpu_limit',
        'memory_limit', 'disk_limit',
        'backup_limit', 'database_limit',
        'allocation_limit',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'category_id' => 'integer',
        'cpu_limit' => 'integer',
        'memory_limit' => 'integer',
        'disk_limit' => 'integer',
        'backup_limit' => 'integer',
        'database_limit' => 'integer',
        'allocation_limit' => 'integer',
    ];

    public static array $validationRules = [
        'uuid' => 'required|string|size:36',
        'category_id' => 'required|exists:categories,id',

        'name' => 'required|string|min:3|max:191',
        'icon' => 'nullable|string|min:3|max:300',
        'price' => 'required',
        'description' => 'nullable|string|max:300',

        'cpu_limit' => 'required|integer',
        'memory_limit' => 'required|integer',
        'disk_limit' => 'required|integer',

        'backup_limit' => 'required|integer',
        'database_limit' => 'required|integer',
        'allocation_limit' => 'required|integer',
    ];

    /**
     * Gets information for the category associated with this product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
