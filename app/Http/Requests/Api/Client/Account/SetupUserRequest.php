<?php

namespace Everest\Http\Requests\Api\Client\Account;

use Illuminate\Container\Container;
use Illuminate\Contracts\Hashing\Hasher;
use Everest\Http\Requests\Api\Client\ClientApiRequest;
use Everest\Exceptions\Http\Base\InvalidPasswordProvidedException;

class SetupUserRequest extends ClientApiRequest
{
    /**
     * @throws \Everest\Exceptions\Http\Base\InvalidPasswordProvidedException
     */
    public function authorize(): bool
    {
        if (!parent::authorize()) {
            return false;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:3'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}
