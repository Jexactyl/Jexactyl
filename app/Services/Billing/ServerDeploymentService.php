<?php

namespace Everest\Services\Billing;

use Carbon\Carbon;
use Everest\Models\Egg;
use Everest\Models\User;
use Everest\Models\Server;
use Everest\Models\Allocation;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Models\Billing\BillingException;
use Everest\Services\Servers\ServerCreationService;
use Everest\Exceptions\Service\Deployment\NoViableAllocationException;

class ServerDeploymentService
{
    /**
     * ServerDeploymentService constructor.
     */
    public function __construct(
        protected ServerCreationService $creation,
    ) {
    }

    /**
     * Process the creation of a server.
     *
     * @throws NoViableAllocationException
     */
    public function handle(User $user, Product $product, object $metadata, Order $order): Server
    {
        $renewalDays = config('modules.billing.renewal.days', 30);
        $metadataEggId = $metadata->egg_id ?? '';
        $egg = $this->resolveEgg($product, $metadataEggId !== '' ? (int) $metadataEggId : null);
        $allocation = $this->getAllocation($metadata->node_id, $order->id);
        $environment = $this->getEnvironment($egg->id, json_decode($metadata->variables));

        try {
            $server = $this->creation->handle([
                'node_id' => $metadata->node_id,
                'allocation_id' => $allocation,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'name' => $user->username . '\'s ' . $product->name . ' Server',
                'owner_id' => $user->id,
                'memory' => $product->memory_limit,
                'swap' => 0,
                'disk' => $product->disk_limit,
                'io' => 500,
                'cpu' => $product->cpu_limit,
                'startup' => $egg->startup,
                'environment' => $environment,
                'image' => current($egg->docker_images),
                'billing_product_id' => $product->id,
                'renewal_date' => Carbon::now()->addDays($renewalDays)->toDateTimeString(),
                'database_limit' => $product->database_limit,
                'backup_limit' => $product->backup_limit,
                'allocation_limit' => $product->allocation_limit,
                'subuser_limit' => 3,
            ]);
        } catch (DisplayException $ex) {
            BillingException::create([
                'order_id' => $order->id,
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'title' => 'Failed to create billable server',
                'description' => $ex->getMessage(),
            ]);

            throw new DisplayException('Unable to create server: ' . $ex->getMessage());
        }

        return $server;
    }

    /**
     * Resolve the egg to deploy for a product. Categories with a fixed egg always use it;
     * otherwise the customer's chosen egg is used, provided it belongs to the category's nest
     * (this is the boundary that stops a tampered request from deploying an unrelated egg).
     *
     * @throws DisplayException
     */
    protected function resolveEgg(Product $product, ?int $chosenEggId): Egg
    {
        $eggId = $product->category->egg_id ?: $chosenEggId;

        if (!$eggId) {
            throw new DisplayException('An egg must be selected to deploy this product.');
        }

        $egg = Egg::findOrFail($eggId);

        if ((int) $egg->nest_id !== (int) $product->category->nest_id) {
            throw new DisplayException('The selected egg does not belong to this product\'s nest.');
        }

        return $egg;
    }

    /**
     * Merge custom environment variables with defaults for an egg.
     * Custom variables take precedence over defaults.
     */
    protected function getEnvironment(int $eggId, array $customVariables = []): array
    {
        $variables = [];
        $defaults = EggVariable::where('egg_id', $eggId)->get();

        // Start with defaults
        foreach ($defaults as $variable) {
            $variables[$variable->env_variable] = $variable->default_value;
        }

        // Override with custom variables
        foreach ($customVariables as $variable) {
            if (is_array($variable)
                && array_key_exists('key', $variable)
                && array_key_exists('value', $variable)
                && !empty($variable['key'])) {
                $variables[$variable['key']] = $variable['value'];
            }
        }

        return $variables;
    }

    /**
     * Get a suitable allocation to deploy to.
     */
    protected function getAllocation(int $nodeId, int $orderId): int
    {
        $allocation = Allocation::where('node_id', $nodeId)->where('server_id', null)->first();

        if (!$allocation) {
            BillingException::create([
                'order_id' => $orderId,
                'exception_type' => BillingException::TYPE_DEPLOYMENT,
                'title' => 'Failed to find allocation to assign to server',
                'description' => 'Create more allocations (ports) for node ' . $nodeId,
            ]);

            throw new NoViableAllocationException('No allocations are available for deployment.');
        }

        return $allocation->id;
    }
}
