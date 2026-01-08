<?php

namespace Everest\Services\Servers;

use Everest\Models\Egg;
use Everest\Models\User;
use Everest\Models\Server;
use Everest\Models\Allocation;
use Everest\Models\EggVariable;
use Everest\Models\ServerPreset;
use Everest\Exceptions\DisplayException;

class ServerPresetCreationService
{
    /**
     * ServerPresetCreationService constructor.
     */
    public function __construct(private ServerCreationService $creationService)
    {
    }

    /**
     * Create a server via a server preset, referencing
     * ServerCreationService as the main service.
     *
     * @throws \Throwable
     * @throws DisplayException
     */
    public function handle(User $user, array $data): Server
    {
        $preset = ServerPreset::findOrFail($data['preset_id']);
        $egg = Egg::findOrFail($preset->egg_id ?? 1);
        $allocation = Allocation::where('node_id', $data['node_id'])->where('server_id', null)->first();
        $environment = $this->getEnvironmentWithDefaults($egg);

        $data = [
            'owner_id' => $user->id,
            'name' => $preset->name . ' server',
            'node_id' => (int) $data['node_id'],
            'cpu' => $preset->cpu,
            'memory' => $preset->memory,
            'disk' => $preset->disk,
            'nest_id' => $preset->node_id ?? 1,
            'egg_id' => $preset->egg_id ?? 1,
            'allocation_id' => $allocation->id,
            'image' => current($egg->docker_images),
            'startup' => $egg->startup,
            'environment' => $environment,
        ];

        $server = $this->creationService->handle($data);

        return $server;
    }

    /**
     * Get all environment variables with their default values for an egg.
     */
    private function getEnvironmentWithDefaults(Egg $egg): array
    {
        $variables = [];
        $defaults = EggVariable::where('egg_id', $egg->id)->get();

        foreach ($defaults as $variable) {
            $variables[$variable->env_variable] = $variable->default_value;
        }

        return $variables;
    }
}
