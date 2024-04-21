<?php

namespace Everest\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $uuid
 * 
 * @property string $name
 * @property double $balance
 * @property int $bill_date
 * @property string $state
 * 
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class BillingAccount extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'billing_account';

    /**
     * The table associated with the model.
     */
    protected $table = 'billing_accounts';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'uuid', 'name', 'user_id',
        'balance', 'bill_date', 'state',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'user_id' => 'integer',
        'balance' => 'double',
        'bill_date' => 'integer',
    ];

    public static array $validationRules = [
        'user_id' => 'required|int|exists:users,id',
        'uuid' => 'required|string|size:36',
        'name' => 'required|string|min:3|max:191',
        'balance' => 'required|double',
        'bill_date' => 'required|integer|min:1|max:31',
        'state' => 'string|nullable|in:active,arrears,cancelled',
    ];

    /**
     * Gets user associated with this billing account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
