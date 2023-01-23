<?php

namespace Jexactyl\Services\Nests;

use Jexactyl\Contracts\Repository\NestRepositoryInterface;
use Jexactyl\Exceptions\Service\HasActiveServersException;
use Jexactyl\Contracts\Repository\ServerRepositoryInterface;

class NestDeletionService
{
    /**
     * NestDeletionService constructor.
     */
    public function __construct(
        protected ServerRepositoryInterface $serverRepository,
        protected NestRepositoryInterface $repository
    ) {
    }

    /**
     * Delete a nest from the system only if there are no servers attached to it.
     *
     * @throws \Jexactyl\Exceptions\Service\HasActiveServersException
     */
    public function handle(int $nest): int
    {
        $count = $this->serverRepository->findCountWhere([['nest_id', '=', $nest]]);
        if ($count > 0) {
            throw new HasActiveServersException(trans('exceptions.nest.delete_has_servers'));
        }

        return $this->repository->delete($nest);
    }
}
