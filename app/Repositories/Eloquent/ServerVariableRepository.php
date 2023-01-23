<?php

namespace Jexactyl\Repositories\Eloquent;

use Jexactyl\Models\ServerVariable;
use Jexactyl\Contracts\Repository\ServerVariableRepositoryInterface;

class ServerVariableRepository extends EloquentRepository implements ServerVariableRepositoryInterface
{
    /**
     * Return the model backing this repository.
     */
    public function model(): string
    {
        return ServerVariable::class;
    }
}
