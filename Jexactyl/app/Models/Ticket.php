<?php

namespace Everest\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Everest\Models\Ticket.
 *
 * @property int $id
 * @property User $user
 * @property User|null $assigned
 * @property int $user_id
 * @property int|null $assigned_to
 * @property string $title
 * @property string $status
 * @property Collection|TicketMessage[] $messages
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Ticket extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ticket';

    public const STATUS_PENDING = 'pending';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_UNRESOLVED = 'unresolved';
    public const STATUS_IN_PROGRESS = 'in-progress';

    /**
     * The table associated with the model.
     */
    protected $table = 'tickets';

    /**
     * Default values when creating the model.
     */
    protected $attributes = ['status' => self::STATUS_PENDING];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [self::CREATED_AT, self::UPDATED_AT];

    /**
     * Fields that are not mass assignable.
     */
    protected $guarded = ['id', self::CREATED_AT, self::UPDATED_AT];

    /**
     * Fields that are mass-assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'assigned_to',
        'status',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'user_id' => 'required|int|exists:users,id',
        'title' => 'required|string|min:3|max:191',
        'assigned_to' => 'nullable|int|exists:users,id',
        'status' => 'required|string|in:pending,resolved,unresolved,in-progress',
    ];

    /**
     * Gets the user who made the ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Gets the staff member who this ticket has been assigned to.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get whether the ticket is in 'resolved' state.
     */
    public function isResolved(): bool
    {
        return $this->status === self::STATUS_RESOLVED;
    }

    /**
     * Gets all messages associated with this ticket.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class, 'ticket_id');
    }

    /**
     * Get the validation rules for incoming requests.
     */
    public static function rules(): array
    {
        return self::$validationRules;
    }
}
