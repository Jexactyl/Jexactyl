<?php

namespace Everest\Services\Billing;

use Everest\Models\Egg;
use Stripe\StripeObject;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\Allocation;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Servers\ServerCreationService;
use Everest\Exceptions\Service\Deployment\NoViableAllocationException;

class CreateServerService
{
    /**
     * CreateServerService constructor.
     */
    public function __construct(
        private ServerCreationService $creation,
    ) {
    }

    /**
     * Process the creation of a server.
     */
    public function process(Request $request, Product $product, StripeObject $data): Server
    {
        $egg = Egg::findOrFail($product->category->egg_id);

        $allocation = $this->getAllocation((int) $data['node_id']);
        $environment = $this->getServerEnvironment($data['environment'], $egg->id);

        try {
            $server = $this->creation->handle([
                'node_id' => (int) $data['node_id'],
                'allocation_id' => $allocation,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'name' => $data['username'] . '\'s server',
                'owner_id' => (int) $data['user_id'],
                'memory' => $product->memory_limit,
                'swap' => 0,
                'disk' => $product->disk_limit,
                'io' => 500,
                'cpu' => $product->cpu_limit,
                'startup' => $egg->startup,
                'environment' => $environment,
                'image' => current($egg->docker_images),
                'database_limit' => $product->database_limit,
                'backup_limit' => $product->backup_limit,
                'allocation_limit' => $product->allocation_limit,
                'subuser_limit' => 3,
            ]);
        } catch (DisplayException $ex) {
            throw new DisplayException('Unable to create server: ' . $ex->getMessage());
        }

        return $server;
    }

    /**
     * Get the environment variables for the new server.
     */
    private function getServerEnvironment(string $data, int $id): array
    {
        $decoded = json_decode($data, true);

        $variables = [];
        $default = EggVariable::where('egg_id', $id)->get();

        foreach ($decoded as $variable) {
            $variables += [$variable['key'] => $variable['value']];
        }

        foreach ($default as $variable) {
            if (!array_key_exists($variable->env_variable, $variables)) {
                $variables += [$variable->env_variable => $variable->default_value];
            }
        }

        return $variables;
    }

    /**
     * Get a suitable allocation to deploy to.
     */
    private function getAllocation(int $id): int
    {
        $allocation = Allocation::where('node_id', $id)->where('server_id', null)->first();

        if (!$allocation) {
            throw new NoViableAllocationException('No allocations are available for deployment.');
        }

        return $allocation->id;
    }
}
