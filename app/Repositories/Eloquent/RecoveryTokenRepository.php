<?php

namespace Jexactyl\Repositories\Eloquent;

use Jexactyl\Models\RecoveryToken;

class RecoveryTokenRepository extends EloquentRepository
{
    public function model(): string
    {
        return RecoveryToken::class;
    }
}
