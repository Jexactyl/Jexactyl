<?php

namespace Everest\Models;

use Everest\Contracts\Repository\SettingsRepositoryInterface;

/**
 * Everest\Models\Setting.
 *
 * @property int $id
 * @property string $key
 * @property string $value
 */
class Setting extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'settings';

    public $timestamps = false;

    protected $fillable = ['key', 'value'];

    public static array $validationRules = [
        'key' => 'required|string|between:1,191',
        'value' => 'string',
    ];

    /**
     * Convenience wrapper around the repository get.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return app(SettingsRepositoryInterface::class)->get($key, $default);
    }

    /**
     * Convenience wrapper around the repository set.
     */
    public static function set(string $key, mixed $value = null): void
    {
        app(SettingsRepositoryInterface::class)->set($key, $value);
    }

    /**
     * Convenience wrapper around the repository forget.
     */
    public static function forget(string $key): void
    {
        app(SettingsRepositoryInterface::class)->forget($key);
    }
}
