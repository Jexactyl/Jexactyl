<?php

namespace Everest\Models\Billing;

use Everest\Models\Model;

/**
 * @property int $id
 * @property string $uuid
 * 
 * @property string $name
 * @property string $icon
 * @property string $description
 * @property bool $visible
 * 
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Category extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'category';

    /**
     * The table associated with the model.
     */
    protected $table = 'categories';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'uuid', 'name', 'visible',
        'icon', 'description',
    ];

    public static array $validationRules = [
        'uuid' => 'required|string|size:36',
        'name' => 'required|string|min:3|max:191',
        'icon' => 'nullable|string|max:300',
        'description' => 'nullable|string|max:300',
        'visible' => 'nullable|bool',
    ];
}
