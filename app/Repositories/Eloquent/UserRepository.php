<?php

namespace Jexactyl\Repositories\Eloquent;

use Jexactyl\Models\User;
use Jexactyl\Contracts\Repository\UserRepositoryInterface;

class UserRepository extends EloquentRepository implements UserRepositoryInterface
{
    /**
     * Return the model backing this repository.
     */
    public function model(): string
    {
        return User::class;
    }
}
