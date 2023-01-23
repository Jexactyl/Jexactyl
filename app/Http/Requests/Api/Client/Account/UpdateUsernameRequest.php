<?php

namespace Jexactyl\Http\Requests\Api\Client\Account;

use Jexactyl\Models\User;
use Illuminate\Container\Container;
use Illuminate\Contracts\Hashing\Hasher;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;
use Jexactyl\Exceptions\Http\Base\InvalidPasswordProvidedException;

class UpdateUsernameRequest extends ClientApiRequest
{
    /**
     * @throws \Jexactyl\Exceptions\Http\Base\InvalidPasswordProvidedException
     */
    public function authorize(): bool
    {
        if (!parent::authorize()) {
            return false;
        }

        $hasher = Container::getInstance()->make(Hasher::class);

        // Verify password matches.
        if (!$hasher->check($this->input('password'), $this->user()->password)) {
            throw new InvalidPasswordProvidedException(trans('validation.internal.invalid_password'));
        }

        return true;
    }

    public function rules(): array
    {
        $rules = User::getRulesForUpdate($this->user());

        return ['username' => $rules['username']];
    }
}
