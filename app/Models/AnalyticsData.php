<?php

namespace Jexactyl\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $server_id
 * @property int $cpu
 * @property int $memory
 * @property int $disk
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AnalyticsData extends Model
{
    use HasFactory;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'analytics_data';

    /**
     * The table associated with the model.
     */
    protected $table = 'analytics_data';

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
    protected $fillable = ['server_id', 'cpu', 'memory', 'disk'];

    /**
     * Rules verifying that the data being stored matches the expectations of the database.
     */
    public static array $validationRules = [
        'server_id' => 'required|int|unique:servers,id',
        'cpu' => 'required|int|min:0|max:100',
        'memory' => 'required|int|min:0|max:100',
        'disk' => 'required|int|min:0|max:100',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class, 'server_id');
    }
}
