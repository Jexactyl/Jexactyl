<?php

namespace Everest\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;

/**
 * Everest\Models\JGuardAttempt.
 *
 * @property int $id
 * @property string $ip
 * @property string $type
 * @property \Illuminate\Support\Carbon $created_at
 *
 * @method static Builder|JGuardAttempt query()
 */
class JGuardAttempt extends Model
{
    use MassPrunable;

    public const UPDATED_AT = null;

    public const TYPE_REGISTRATION = 'registration';
    public const TYPE_FAILED_LOGIN = 'failed_login';

    protected $table = 'jguard_attempts';

    protected $fillable = ['ip', 'type'];

    public static array $validationRules = [
        'ip' => 'required|ip',
        'type' => 'required|string|in:registration,failed_login',
    ];

    /**
     * Attempts are only ever needed to look back across the widest configured jGuard
     * sensitivity window, so we don't hold on to raw IP addresses any longer than that.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subDay());
    }
}
