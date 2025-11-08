<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\Server;
use Everest\Models\ServerGroup;
use Illuminate\Http\JsonResponse;
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
        return $this->fractal->collection($request->user()->serverGroups)
            ->transformWith(ServerGroupTransformer::class)
            ->toArray();
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

        return $this->fractal->item($group)
            ->transformWith(ServerGroupTransformer::class)
            ->toArray();
    }

    /**
     * Add a server to the selected group.
     */
    public function add(ClientApiRequest $request, int $id): JsonResponse
    {
        $server = Server::where('uuid', $request->input('server'))->first();

        try {
            $server->update(['group_id' => $id]);
        } catch (DisplayException $ex) {
            throw new DisplayException('Unable to assign group to server.');
        }

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    /**
     * Remove a server from the selected group.
     */
    public function remove(ClientApiRequest $request, int $id): JsonResponse
    {
        $server = Server::where('uuid', $request->input('server'))->first();

        $server->update(['group_id' => null]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    /**
     * Update a selected server group.
     */
    public function update(ClientApiRequest $request, int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        $group->update([
            'name' => $request['name'] ?? $group->name,
            'color' => $request['color'] ?? $group->color,
        ]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    /**
     * Delete a selected server group.
     */
    public function delete(ClientApiRequest $request, int $id): JsonResponse
    {
        $group = ServerGroup::findOrFail($id);

        $group->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}
