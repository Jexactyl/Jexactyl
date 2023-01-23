<?php

namespace Jexactyl\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $server_id
 * @property string $title
 * @property string $content
 * @property string $type
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AnalyticsMessage extends Model
{
    use HasFactory;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'analytics_message';

    /**
     * The table associated with the model.
     */
    protected $table = 'analytics_messages';

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
    protected $fillable = ['server_id', 'title', 'content', 'type'];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'server_id' => 'required|int|unique:servers,id',
        'title' => 'required|string|min:3|max:191',
        'content' => 'required|string|min:3|max:191',
        'type' => 'required|in:success,info,warning,danger',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'server_id');
    }
}
