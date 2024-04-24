<?php

namespace Everest\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Everest\Models\TicketMessage.
 *
 * @property int $id
 * @property Ticket $ticket
 * @property int $ticket_id
 * @property User $user
 * @property int $user_id
 * @property string $message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TicketMessage extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ticket_messages';

    /**
     * The table associated with the model.
     */
    protected $table = 'ticket_messages';

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
        'ticket_id',
        'user_id',
        'message',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'ticket_id' => 'required|int',
        'message' => 'required|string|min:3|max:500',
    ];

    /**
     * Gets the ticket which this message has been assigned to.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    /**
     * Gets the user associated with this ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
