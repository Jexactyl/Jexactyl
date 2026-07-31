<?php

namespace Everest\Extensions\Laravel\Sanctum;

use Everest\Models\ApiKey;
use Illuminate\Contracts\Support\Jsonable;
use Illuminate\Contracts\Support\Arrayable;

/**
 * Everest's API keys are not stored using Sanctum's `PersonalAccessToken` model,
 * so this cannot extend `Laravel\Sanctum\NewAccessToken` (its `$accessToken`
 * property is strictly typed to `PersonalAccessToken`). This reimplements the
 * same value-object shape independently.
 */
class NewAccessToken implements Arrayable, Jsonable
{
    public function __construct(public ApiKey $accessToken, public string $plainTextToken)
    {
    }

    public function toArray(): array
    {
        return [
            'accessToken' => $this->accessToken,
            'plainTextToken' => $this->plainTextToken,
        ];
    }

    public function toJson($options = 0): string
    {
        return json_encode($this->toArray(), $options);
    }
}
