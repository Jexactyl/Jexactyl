<?php

namespace Everest\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * \Everest\Models\UserPasskey.
 *
 * @property int $id
 * @property int $user_id
 * @property string $uuid
 * @property string $name
 * @property string $credential_id
 * @property string $credential
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property User $user
 *
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey query()
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereCredential($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereCredentialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereLastUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserPasskey whereUuid($value)
 * @method static \Database\Factories\UserPasskeyFactory factory(...$parameters)
 *
 * @mixin \Eloquent
 */
class UserPasskey extends Model
{
    /** @use HasFactory<\Database\Factories\UserPasskeyFactory> */
    use HasFactory;

    public const RESOURCE_NAME = 'passkey';

    protected $table = 'user_passkeys';

    protected $fillable = [
        'uuid',
        'name',
        'credential_id',
        'credential',
        'last_used_at',
    ];

    /**
     * The credential material is never exposed outside of the verification service.
     */
    protected $hidden = [
        'credential_id',
        'credential',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public static array $validationRules = [
        'uuid' => ['required', 'string', 'size:36'],
        'name' => ['required', 'string', 'max:191'],
        'credential_id' => ['required', 'string', 'max:255'],
        'credential' => ['required', 'string'],
    ];

    protected static function booted(): void
    {
        static::creating(function (self $passkey) {
            $passkey->uuid = $passkey->uuid ?? Str::uuid()->toString();
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
