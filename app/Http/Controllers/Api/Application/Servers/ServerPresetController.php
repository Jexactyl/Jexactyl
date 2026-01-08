<?php

namespace Everest\Http\Controllers\Api\Application\Servers;

use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Models\ServerPreset;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Transformers\Api\Application\ServerPresetTransformer;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Servers\Presets\GetServerPresetRequest;
use Everest\Http\Requests\Api\Application\Servers\Presets\GetServerPresetsRequest;
use Everest\Http\Requests\Api\Application\Servers\Presets\StoreServerPresetRequest;
use Everest\Http\Requests\Api\Application\Servers\Presets\DeleteServerPresetRequest;
use Everest\Http\Requests\Api\Application\Servers\Presets\UpdateServerPresetRequest;

class ServerPresetController extends ApplicationApiController
{
    /**
     * ServerPresetController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Return all the server presets that currently exist on the Panel.
     */
    public function index(GetServerPresetsRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $presets = QueryBuilder::for(ServerPreset::query())
            ->allowedFilters(['id', 'uuid', 'name'])
            ->allowedSorts(['id', 'uuid', 'name', 'cpu', 'memory', 'disk', 'nest_id', 'egg_id'])
            ->paginate($perPage);

        return $this->fractal->collection($presets)
            ->transformWith(ServerPresetTransformer::class)
            ->toArray();
    }

    /**
     * View an existing server preset.
     */
    public function view(GetServerPresetRequest $request, int $id): array
    {
        $preset = ServerPreset::findOrFail($id);

        return $this->fractal->item($preset)
            ->transformWith(ServerPresetTransformer::class)
            ->toArray();
    }

    /**
     * Store a new server preset in the database.
     */
    public function store(StoreServerPresetRequest $request): array
    {
        $preset = ServerPreset::create($request->normalize());

        Activity::event('admin:server_presets:create')
            ->property('server_preset', $preset)
            ->description('A server preset was created')
            ->log();

        return $this->fractal->item($preset)
            ->transformWith(ServerPresetTransformer::class)
            ->toArray();
    }

    /**
     * Update an existing server preset in the database.
     */
    public function update(UpdateServerPresetRequest $request, int $id): array
    {
        $preset = ServerPreset::findOrFail($id);

        $preset->fill($request->normalize())->saveOrFail();

        Activity::event('admin:server_presets:update')
            ->property('server_preset', $preset)
            ->description('A server preset was updated')
            ->log();

        return $this->fractal->item($preset)
            ->transformWith(ServerPresetTransformer::class)
            ->toArray();
    }

    /**
     * Delete an existing server preset in the database.
     */
    public function delete(DeleteServerPresetRequest $request, int $id): Response
    {
        $preset = ServerPreset::findOrFail($id);

        Activity::event('admin:server_presets:delete')
            ->property('server_preset', $preset)
            ->description('A server preset was deleted')
            ->log();

        $preset->delete();

        return $this->returnNoContent();
    }
}
