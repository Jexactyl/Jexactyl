<?php

namespace Everest\Services\Billing;

use Everest\Models\Egg;
use Stripe\StripeObject;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Servers\ServerCreationService;

class CreateServerService
{
    /**
     * ServerCreationService constructor.
     */
    public function __construct(
        private ServerCreationService $creation,
    )
    {
        //
    }

    /**
     * Process the creation of a server.
     */
    public function process(Request $request, Product $product, StripeObject $data): Server
    {
        $egg = Egg::findOrFail($product->category->egg_id);
        $environment = $this->getServerEnvironment(json_decode($data['environment'], true), $egg->id);

        // todo(jex): Let users pick node in frontend.
        try {
            $server = $this->creation->handle([
                'node_id' => 1,
                'allocation_id' => 11,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'name' => $data['username'] . '\'s server',
                'owner_id' => $data['user_id'],
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
    private function getServerEnvironment(array $data, int $id): array
    {
        $variables = [];
        $default = EggVariable::where('egg_id', $id)->get();

        foreach ($data as $variable) {
            $variables += [$variable['key'] => $variable['value']];
        }

        foreach ($default as $variable) {
            if (!array_key_exists($variable->env_variable, $variables)) {
                $variables += [$variable->env_variable => $variable->default_value];
            };
        }

        return $variables;
    }
}
