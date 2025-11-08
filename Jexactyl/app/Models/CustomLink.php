<?php

namespace Everest\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Everest\Models\CustomLink.
 *
 * @property int $id
 * @property string $url
 * @property string $name
 * @property bool $visible
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CustomLink extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'custom_links';

    /**
     * The table associated with the model.
     */
    protected $table = 'custom_links';

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [self::CREATED_AT, self::UPDATED_AT];

    /**
     * Fields that are not mass assignable.
     */
    protected $guarded = ['id', self::CREATED_AT, self::UPDATED_AT];

    /**
     * Fields that are mass-assignable.
     */
    protected $fillable = [
        'url',
        'name',
        'visible',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'url' => 'required|url',
        'name' => 'required|string|min:3',
        'visible' => 'required|bool',
    ];

    /**
     * Get the validation rules for incoming requests.
     */
    public static function rules(): array
    {
        return self::$validationRules;
    }
}
