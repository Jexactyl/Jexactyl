<?php

namespace Everest\Models\Billing;

use Everest\Models\Model;

/**
 * @property int $id
 * @property string $code
 * @property string $description
 * @property string $type
 * @property int $value
 * @property int|null $uses
 * @property bool $active
 * @property \Carbon\Carbon|null $expires_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class DiscountCode extends Model
{
    public const TYPE_PERCENTAGE = 'percent';
    public const TYPE_NUMERIC = 'numeric';

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'discount_codes';

    /**
     * The table associated with the model.
     */
    protected $table = 'discount_codes';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'code', 'description', 'type', 'value', 'uses', 'active', 'expires_at',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'value' => 'int',
        'uses' => 'int',
        'active' => 'boolean',
        'expires_at' => 'date',
    ];

    public static array $validationRules = [
        'code' => 'string|required|min:4|max:16',
        'description' => 'string|required|min:3',
        'type' => 'string|required|in:percentage,numeric',
        'value' => 'int|required|min:0',
        'uses' => 'int|nullable|min:-1',
        'active' => 'bool|required',
        'expires_at' => 'date|nullable',
    ];

    /**
     * A function to expire a discount code and instantly invalidate it.
     */
    public function expire(): void
    {
        $this->update([
            'active' => false,
            'expires_at' => now(),
        ]);
    }

    /**
     * Validate that a code is not currently expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at ? $this->expires_at->isPast() : false;
    }

    /**
     * Ensure the code has uses available when trying to use it again.
     */
    public function hasUsesRemaining(): bool
    {
        return $this->uses === null || $this->uses === -1 || $this->uses > 0;
    }

    /**
     * A general check to ensure overall validity of this discount code.
     */
    public function isValid(): bool
    {
        if (!$this->active) {
            return false;
        }

        if ($this->isExpired()) {
            return false;
        }

        if (!$this->hasUsesRemaining()) {
            return false;
        }

        return true;
    }

    /**
     * A helper function to apply a discount code to an order.
     */
    public function apply(int $amount): int
    {
        if ($this->type === self::TYPE_PERCENTAGE) {
            return max(0, $amount - intval($amount * ($this->value / 100)));
        }

        return max(0, $amount - $this->value);
    }

    /**
     * Decrement the amount of uses available to this code.
     */
    public function use(): void
    {
        if ($this->uses !== null && $this->uses > 0) {
            $this->decrement('uses');
        }

        if ($this->uses === 0) {
            $this->expire();
        }
    }
}
