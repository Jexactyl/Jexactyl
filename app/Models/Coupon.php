<?php

namespace Jexactyl\Models;

/**
 * @property string $code
 * @property int $uses
 * @property int $expires
 * @property int $cr_amount
 */
class Coupon extends Model
{
    public const RESOURCE_NAME = 'coupon';
    protected $table = 'coupons';

    protected $fillable = [
        'expired',
    ];

    public static array $validationRules = [
        'code' => 'required|string',
        'uses' => 'required|integer',
        'expires' => 'nullable|string',
        'expired' => 'nullable|boolean',
        'cr_amount' => 'required|integer',
    ];
}
