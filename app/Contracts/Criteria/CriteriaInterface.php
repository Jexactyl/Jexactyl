<?php

namespace Everest\Contracts\Criteria;

use Everest\Repositories\Repository;
use Illuminate\Database\Eloquent\Model;

interface CriteriaInterface
{
    /**
     * Apply selected criteria to a repository call.
     */
    public function apply(Model $model, Repository $repository): mixed;
}
