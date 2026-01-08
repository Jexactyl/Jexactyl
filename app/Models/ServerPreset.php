<?php

namespace Everest\Models;

use Illuminate\Support\Str;

/**
 * \Everest\Models\ServerPreset.
 *
 * @property int $id
 * @property string $uuid
 * @property string $name
 * @property string|null $description
 * @property int $memory
 * @property int $disk
 * @property int $cpu
 * @property int|null $nest_id
 * @property int|null $egg_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Everest\Models\Nest $nest
 * @property \Everest\Models\Egg $egg
 */
class ServerPreset extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'server_preset';

    /**
     * The table associated with the model.
     */
    protected $table = 'server_presets';

    /**
     * Fields that are not mass assignable.
     */
    protected $guarded = ['id', self::CREATED_AT, self::UPDATED_AT];

    public static array $validationRules = [
        'name' => 'required|string|min:1|max:191',
        'description' => 'nullable|string',
        'memory' => 'required|numeric|min:0',
        'cpu' => 'required|numeric|min:0',
        'disk' => 'required|numeric|min:0',
        'nest_id' => 'nullable|exists:nests,id',
        'egg_id' => 'nullable|exists:eggs,id',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'memory' => 'integer',
        'disk' => 'integer',
        'cpu' => 'integer',
        'nest_id' => 'integer',
        'egg_id' => 'integer',
        self::CREATED_AT => 'datetime',
        self::UPDATED_AT => 'datetime',
    ];

    public static function rules(): array
    {
        return self::$validationRules;
    }

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->uuid = $model->uuid ?? (string) Str::uuid();
        });
    }
}
