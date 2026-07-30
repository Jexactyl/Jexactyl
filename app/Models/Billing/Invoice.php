<?php

namespace Everest\Models\Billing;

use Everest\Models\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $uuid
 * @property int $order_id
 * @property string|null $number
 * @property string $disk
 * @property string $path
 * @property array|null $snapshot
 * @property \Carbon\Carbon|null $generated_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property Order $order
 */
class Invoice extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'invoice';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'uuid', 'order_id', 'number', 'disk', 'path', 'snapshot', 'generated_at',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'order_id' => 'int',
        'snapshot' => 'array',
        'generated_at' => 'datetime',
    ];

    public static array $validationRules = [
        // Not 'required': the "saving" validation this base Model performs fires
        // before the "creating" hook below runs, so uuid is always empty at
        // validation time for a fresh model — it's populated just before insert.
        'uuid' => 'nullable|string',
        'order_id' => 'required|exists:orders,id',
        'number' => 'nullable|string',
        'disk' => 'required|string',
        'path' => 'required|string',
        'snapshot' => 'nullable|array',
        'generated_at' => 'nullable|date',
    ];

    /**
     * Gets the order this invoice was generated for.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * When the model is creating, add the UUID here.
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = Str::uuid()->toString();
            }
        });
    }
}
