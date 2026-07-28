<?php

namespace Everest\Http\Requests\Api\Client\Account;

use Everest\Http\Requests\Api\Client\ClientApiRequest;

class UpdateAvatarRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:500', 'url'],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ];
    }
}
