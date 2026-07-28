<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\Server;
use Illuminate\Http\Response;
use Everest\Models\ServerGroup;
use Everest\Exceptions\DisplayException;
use Everest\Http\Requests\Api\Client\ClientApiRequest;
use Everest\Transformers\Api\Client\ServerGroupTransformer;

class ServerGroupController extends ClientApiController
{
    /**
     * Returns all the API keys that exist for the given client.
     */
    public function index(ClientApiRequest $request): array
    {
        return $this->transform($request->user()->serverGroups, ServerGroupTransformer::class);
    }

    /**
     * Create a new server group and store in the database.
     */
    public function store(ClientApiRequest $request): array
    {
        $group = ServerGroup::create([
            'user_id' => $request->user()->id,
            'name' => $request->input('name'),
            'color' => $request->input('color') ?? null,
        ]);

        return $this->transform($group, ServerGroupTransformer::class);
    }

    /**
     * Add a server to the selected group.
     */
    public function add(ClientApiRequest $request, int $id): Response
    {
        $group = ServerGroup::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$group) {
            throw new DisplayException('No group with that ID exists on your account.');
        }

        $server = Server::where('uuid', $request->input('server'))
            ->where('owner_id', $request->user()->id)
            ->first();

        if (!$server) {
            throw new DisplayException('No server with that UUID exists on your account.');
        }

        $server->update(['group_id' => $group->id]);

        return $this->returnNoContent();
    }

    /**
     * Remove a server from the selected group.
     */
    public function remove(ClientApiRequest $request, int $id): Response
    {
        $server = Server::where('uuid', $request->input('server'))
            ->where('owner_id', $request->user()->id)
            ->where('group_id', $id)
            ->first();

        if (!$server) {
            throw new DisplayException('No server with that UUID exists in that group on your account.');
        }

        $server->update(['group_id' => null]);

        return $this->returnNoContent();
    }

    /**
     * Update a selected server group.
     */
    public function update(ClientApiRequest $request, int $id): Response
    {
        $group = ServerGroup::findOrFail($id);

        if ($group->user_id !== $request->user()->id) {
            throw new DisplayException('You do not have permission to edit this server group.');
        }

        $group->update([
            'name' => $request['name'] ?? $group->name,
            'color' => $request['color'] ?? $group->color,
        ]);

        return $this->returnNoContent();
    }

    /**
     * Delete a selected server group.
     */
    public function delete(ClientApiRequest $request, int $id): Response
    {
        $group = ServerGroup::findOrFail($id);

        if ($group->user_id !== $request->user()->id) {
            throw new DisplayException('You do not have permission to edit this server group.');
        }

        $group->delete();

        return $this->returnNoContent();
    }
}
