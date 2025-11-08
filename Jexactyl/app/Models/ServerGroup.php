<?php

namespace Everest\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property int $user_id
 * @property string|null $color
 * @property string $payment_intent_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class ServerGroup extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'server_group';

    /**
     * The table associated with the model.
     */
    protected $table = 'server_groups';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'user_id', 'name', 'color',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'user_id' => 'int',
    ];

    public static array $validationRules = [
        'name' => 'string|required|min:3',
        'user_id' => 'required|exists:users,id',
        'color' => 'nullable|regex:/^#[0-9A-Fa-f]{6}$/',
    ];

    /**
     * Gets the user associated with the server group.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Gets the user associated with the server group.
     */
    public function servers(): HasMany
    {
        return $this->hasMany(Server::class, 'group_id');
    }
}
