<?php

namespace Everest\Models;

/**
 * Everest\Models\WebhookEvent.
 *
 * @property int $id
 * @property string $key
 * @property string $description
 * @property bool $enabled
 */
class WebhookEvent extends Model
{
    protected $fillable = ['key', 'description', 'enabled'];

    public static array $validationRules = [
        'key' => 'required|string|between:1,191',
        'description' => 'required|string',
        'enabled' => 'sometimes|bool',
    ];
}
