<?php

namespace Pterodactyl\Models;

use Pterodactyl\Models\User;
use Illuminate\Support\Carbon;
use Pterodactyl\Models\TicketMessage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Pterodactyl\Models\Ticket.
 *
 * @property int $id
 * @property User $staff
 * @property User $client
 * @property int $staff_id
 * @property int $client_id
 * 
 * @property string $title
 * @property string $status
 * @property string $description
 *
 * @property int|null $message_count
 * @property Collection|TicketMessage[] $messages
 * 
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Ticket extends Model
{
    use HasFactory;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ticket';

    public const STATUS_PENDING = 'pending';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_UNRESOLVED = 'unresolved';
    public const STATUS_IN_PROGRESS = 'in_progress';

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
     * Gets the client who made the ticket.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Gets the staff member who this ticket has been assigned to.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
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
}
