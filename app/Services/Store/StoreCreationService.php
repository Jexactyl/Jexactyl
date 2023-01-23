<?php

namespace Jexactyl\Services\Store;

use Jexactyl\Models\Egg;
use Jexactyl\Models\Nest;
use Jexactyl\Models\Node;
use Jexactyl\Models\Server;
use Jexactyl\Models\Allocation;
use Jexactyl\Models\EggVariable;
use Jexactyl\Exceptions\DisplayException;
use Jexactyl\Services\Servers\ServerCreationService;
use Jexactyl\Contracts\Repository\SettingsRepositoryInterface;
use Jexactyl\Http\Requests\Api\Client\Store\CreateServerRequest;
use Jexactyl\Exceptions\Service\Deployment\NoViableAllocationException;

class StoreCreationService
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private ServerCreationService $creationService,
        private StoreVerificationService $verifyService
    ) {
    }

    /**
     * Creates a server on Jexactyl using the Storefront.
     *
     * @throws DisplayException
     */
    public function handle(CreateServerRequest $request): Server
    {
        $egg = Egg::find($request->input('egg'));
        $nest = Nest::find($request->input('nest'))->id;
        $node = Node::find($request->input('node'))->id;

        $this->verifyService->handle($request);

        $data = [
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'owner_id' => $request->user()->id,
            'egg_id' => $egg->id,
            'nest_id' => $nest,
            'node_id' => $node,
            'allocation_id' => $this->getAllocation($node),
            'allocation_limit' => $request->input('ports'),
            'backup_limit' => $request->input('backups'),
            'database_limit' => $request->input('databases'),
            'environment' => [],
            'memory' => $request->input('memory'),
            'disk' => $request->input('disk'),
            'cpu' => $request->input('cpu'),
            'swap' => 0,
            'io' => 500,
            'image' => array_values($egg->docker_images)[0],
            'startup' => $egg->startup,
            'start_on_completion' => false,
            // Settings for the renewal system. Even if the renewal system is disabled,
            // mark this server as enabled - so that if the renewal system is enabled again,
            // it'll be part of the renewable servers.
            'renewable' => true,
            'renewal' => $this->settings->get('jexactyl::renewal:default'),
        ];

        foreach (EggVariable::where('egg_id', $egg->id)->get() as $var) {
            $key = "v1-{$egg->id}-{$var->env_variable}";
            $data['environment'][$var->env_variable] = $request->get($key, $var->default_value);
        }

        return $this->creationService->handle($data);
    }

    /**
     * Gets an allocation for server deployment.
     *
     * @throws NoViableAllocationException
     */
    protected function getAllocation(int $node): int
    {
        $allocation = Allocation::where('node_id', $node)->where('server_id', null)->first();

        if (!$allocation) {
            throw new NoViableAllocationException('No allocations are available for deployment.');
        }

        return $allocation->id;
    }
}
