<?php

namespace Everest\Models\Billing;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property string $uuid
 * @property int $order_id
 * @property string $title
 * @property string $description
 * @property string $exception_type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class BillingException extends Model
{
    use HasFactory;

    public const TYPE_DEPLOYMENT = 'deployment';
    public const TYPE_PAYMENT = 'payment';
    public const TYPE_STOREFRONT = 'storefront';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'uuid', 'order_id', 'title', 'description',
        'exception_type',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'order_id' => 'int',
    ];

    public static array $validationRules = [
        'uuid' => 'string|required',
        'title' => 'string|required|min:3',
        'order_id' => 'required|exists:orders,id',
        'description' => 'required|string|min:3',
        'exception_type' => 'required|string|in:deployment,payment,storefront',
    ];

    /**
     * When the model is creating, add the UUID here.
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            // Automatically generate a UUID if not set
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }
}
