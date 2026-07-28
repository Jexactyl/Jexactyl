<?php

namespace Everest\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;

/**
 * Everest\Models\JGuardDelay.
 *
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $expires_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @method static Builder|JGuardDelay query()
 */
class JGuardDelay extends Model
{
    use MassPrunable;

    protected $table = 'jguard_delay';

    protected $fillable = ['user_id', 'expires_at'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public static array $validationRules = [
        'user_id' => 'required|integer',
        'expires_at' => 'required|date',
    ];

    public function prunable(): Builder
    {
        return static::where('expires_at', '<=', now()->subDay());
    }
}
