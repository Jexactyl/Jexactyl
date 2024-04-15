<?php

namespace Everest\Models;

/**
 * Everest\Models\Theme.
 *
 * @property int $id
 * @property string $key
 * @property string $value
 */
class Theme extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'theme';

    public $timestamps = false;

    protected $fillable = ['key', 'value'];

    public static array $validationRules = [
        'key' => 'required|string|between:1,191',
        'value' => 'string',
    ];
}
