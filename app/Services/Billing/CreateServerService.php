<?php

namespace Everest\Services\Billing;

use Carbon\Carbon;
use Everest\Models\Egg;
use Stripe\StripeObject;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\Allocation;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Models\Billing\BillingException;
use Everest\Services\Servers\ServerCreationService;
use Everest\Services\Servers\VariableValidatorService;
use Everest\Exceptions\Service\Deployment\NoViableAllocationException;

class CreateServerService
{
    /**
     * CreateServerService constructor.
     */
    public function __construct(
        private ServerCreationService $creation,
        private VariableValidatorService $variableValidator,
    ) {
    }

    /**
     * Process the creation of a server.
     */
    public function process(Request $request, Product $product, StripeObject $metadata, Order $order): Server
    {
        $egg = Egg::findOrFail($product->category->egg_id);

        $allocation = $this->getAllocation($metadata->node_id, $order->id);

        // Extract custom variables from metadata if available
        $customVariables = [];
        if (isset($metadata->variables) && $metadata->variables !== null && $metadata->variables !== '') {
            if (is_string($metadata->variables)) {
                $decoded = json_decode($metadata->variables, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new DisplayException('Failed to decode environment variables: ' . json_last_error_msg());
                }
                if (!is_array($decoded)) {
                    throw new DisplayException('Environment variables must be an array.');
                }
                $customVariables = $decoded;
            } elseif (is_array($metadata->variables)) {
                $customVariables = $metadata->variables;
            }
        }

        $environment = $this->getEnvironmentWithCustomVariables($egg->id, $customVariables);

        try {
            // Use paid renewal days for paid servers
            $renewalDays = config('modules.billing.renewal.days', 30);

            $server = $this->creation->handle([
                'node_id' => $metadata->node_id,
                'allocation_id' => $allocation,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'name' => $request->user()->username . '\'s server',
                'owner_id' => $request->user()->id,
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
     * Process the creation of a free server.
     */
    public function processFree(Request $request, Product $product, int $nodeId, Order $order, array $customVariables = []): Server
    {
        $egg = Egg::findOrFail($product->category->egg_id);

        $allocation = $this->getAllocation($nodeId, $order->id);
        $environment = $this->getEnvironmentWithCustomVariables($egg->id, $customVariables);

        try {
            // Use free renewal days for free servers
            $renewalDays = config('modules.billing.renewal.free_renewal_days', 30);

            $server = $this->creation->handle([
                'node_id' => $nodeId,
                'allocation_id' => $allocation,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'name' => $request->user()->username . '\'s server',
                'owner_id' => $request->user()->id,
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
                'title' => 'Failed to create free server',
                'description' => $ex->getMessage(),
            ]);

            throw new DisplayException('Unable to create server: ' . $ex->getMessage());
        }

        return $server;
    }

    /**
     * Merge custom environment variables with defaults for an egg.
     * Custom variables take precedence over defaults.
     */
    private function getEnvironmentWithCustomVariables(int $eggId, array $customVariables = []): array
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
     * Get the environment variables for the new server from JSON string.
     *
     * @deprecated this method is deprecated and will be removed in a future version
     * @see getEnvironmentWithCustomVariables() Use this method directly with decoded array instead.
     */
    private function getServerEnvironment(string $data, int $id): array
    {
        $decoded = json_decode($data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new DisplayException('Failed to decode environment variables: ' . json_last_error_msg());
        }

        return $this->getEnvironmentWithCustomVariables($id, is_array($decoded) ? $decoded : []);
    }

    /**
     * Get a suitable allocation to deploy to.
     */
    private function getAllocation(int $nodeId, int $orderId): int
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
