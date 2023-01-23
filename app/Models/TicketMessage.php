<?php

namespace Jexactyl\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Jexactyl\Models\TicketMessage.
 *
 * @property int $id
 * @property User $user
 * @property int $user_id
 * @property Ticket $ticket
 * @property int $ticket_id
 * @property string $content
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
        'user_id',
        'ticket_id',
        'content',
    ];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'user_id' => 'required|int|unique:users,id',
        'ticket_id' => 'required|int',
        'content' => 'required|string|min:3|max:191',
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
