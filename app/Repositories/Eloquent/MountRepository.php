<?php

namespace Jexactyl\Repositories\Eloquent;

use Jexactyl\Models\Mount;
use Jexactyl\Models\Server;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Jexactyl\Exceptions\Repository\RecordNotFoundException;

class MountRepository extends EloquentRepository
{
    /**
     * Return the model backing this repository.
     */
    public function model(): string
    {
        return Mount::class;
    }

    /**
     * Return mounts with a count of eggs, nodes, and servers attached to it.
     */
    public function getAllWithDetails(): Collection
    {
        return $this->getBuilder()->withCount('eggs', 'nodes')->get($this->getColumns());
    }

    /**
     * Return all the mounts and their respective relations.
     *
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function getWithRelations(string $id): Mount
    {
        try {
            return $this->getBuilder()->with('eggs', 'nodes')->findOrFail($id, $this->getColumns());
        } catch (ModelNotFoundException $exception) {
            throw new RecordNotFoundException();
        }
    }

    /**
     * Return mounts available to a server (ignoring if they are or are not mounted).
     */
    public function getMountListForServer(Server $server): Collection
    {
        return $this->getBuilder()
            ->whereHas('eggs', function ($q) use ($server) {
                $q->where('id', '=', $server->egg_id);
            })
            ->whereHas('nodes', function ($q) use ($server) {
                $q->where('id', '=', $server->node_id);
            })
            ->get($this->getColumns());
    }
}
