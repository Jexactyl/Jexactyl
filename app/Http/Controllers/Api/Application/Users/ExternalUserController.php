<?php

namespace Jexactyl\Http\Controllers\Api\Application\Users;

use Jexactyl\Models\User;
use Jexactyl\Transformers\Api\Application\UserTransformer;
use Jexactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Jexactyl\Http\Requests\Api\Application\Users\GetExternalUserRequest;

class ExternalUserController extends ApplicationApiController
{
    /**
     * Retrieve a specific user from the database using their external ID.
     */
    public function index(GetExternalUserRequest $request, string $external_id): array
    {
        $user = User::query()->where('external_id', $external_id)->firstOrFail();

        return $this->fractal->item($user)
            ->transformWith($this->getTransformer(UserTransformer::class))
            ->toArray();
    }
}
