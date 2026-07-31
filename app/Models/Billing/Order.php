<?php

namespace Everest\Models\Billing;

use Everest\Models\User;
use Everest\Models\Model;
use Everest\Models\Server;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property int $user_id
 * @property string $description
 * @property float $total
 * @property string $status
 * @property int $product_id
 * @property int|null $server_id
 * @property string $type
 * @property int $threat_index
 * @property string|null $transaction_id
 * @property array|null $metadata
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property User $user
 * @property Server|null $server
 * @property Product $product
 * @property Invoice|null $invoice
 */
class Order extends Model
{
    public const STATUS_FAILED = 'failed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSED = 'processed';

    public const TYPE_NEW = 'new';
    public const TYPE_UPGRADE = 'upgrade';
    public const TYPE_RENEWAL = 'renewal';

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'order';

    /**
     * The table associated with the model.
     */
    protected $table = 'orders';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'name', 'user_id', 'description', 'transaction_id',
        'total', 'status', 'product_id', 'type', 'threat_index', 'metadata',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'user_id' => 'int',
        'total' => 'float',
        'product_id' => 'int',
        'threat_index' => 'int',
        'metadata' => 'array',
    ];

    public static array $validationRules = [
        'name' => 'string|required|min:3',
        'user_id' => 'required|exists:users,id',
        'description' => 'required|string|min:3',
        'total' => 'required|min:0',
        'status' => 'required|in:expired,pending,failed,processed',
        'product_id' => 'exists:products,id',
        'type' => 'required|in:new,upgrade,renewal',
        'threat_index' => 'nullable|int|min:-1|max:100',
        'transaction_id' => 'nullable|string',
        'metadata' => 'nullable|array',
    ];

    /**
     * Gets the user who this order is assigned to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Gets the server associated with this order.
     */
    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'server_id');
    }

    /**
     * Gets the product which this order is assigned to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Gets the invoice generated for this order, if any.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'order_id');
    }

    /**
     * Return whether a payment must be collected for this order.
     */
    public function requiresPayment(): bool
    {
        if ($this->total > 0.0) {
            return true;
        }

        return false;

    }

    /**
     * Return whether this order has already been processed.
     */
    public function isProcessed(): bool
    {
        if ($this->status === Order::STATUS_PROCESSED) {
            return true;
        }

        return false;

    }

    /**
     * Return whether this order is a renewal or new server.
     */
    public function isRenewal(): bool
    {
        if ($this->type === Order::TYPE_RENEWAL) {
            return true;
        }

        return false;

    }

    /**
     * Assign a server ID to this model.
     */
    public function assignServer(Server $server): void
    {
        $this->server()->associate($server);

        $this->save();
    }

    /**
     * A helper function to set the order type.
     */
    public function setStatus(string $status): void
    {
        $this->status = $status;

        $this->save();
    }
}
