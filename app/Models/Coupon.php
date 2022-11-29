<?php

namespace Pterodactyl\Models;

/**
 * @property string $code
 * @property integer $uses
 * @property integer $expires
 * @property integer $cr_amount
 */
class Coupon extends Model
{
    public const RESOURCE_NAME = 'coupon';
    protected $table = 'coupons';

    public static array $validationRules = [
        'code' => 'required|string',
        'uses' => 'required|integer',
        'expires' => 'nullable|integer',
        'expired' => 'nullable|boolean',
        'cr_amount' => 'required|integer',
    ];
}
