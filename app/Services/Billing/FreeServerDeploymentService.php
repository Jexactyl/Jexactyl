<?php

namespace Everest\Services\Billing;

use Carbon\Carbon;
use Everest\Models\Node;
use Everest\Models\User;
use Everest\Models\Server;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Models\Billing\BillingException;
use Everest\Services\Servers\ServerCreationService;

class FreeServerDeploymentService extends ServerDeploymentService
{
    public function __construct(
        protected ServerCreationService $creation,
    ) {
        parent::__construct($creation);
    }

    /**
     * Process the creation of a free server.
     */
    public function handleFree(User $user, Product $product, Node $node, Order $order, array $variables, ?int $eggId = null): Server
    {
        $renewalDays = config('modules.billing.renewal.free_renewal_days', 30);
        $egg = $this->resolveEgg($product, $eggId);
        $allocation = $this->getAllocation($node->id, $order->id);
        $environment = $this->getEnvironment($egg->id, $variables);

        try {
            $server = $this->creation->handle([
                'node_id' => $node->id,
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
                'title' => 'Failed to create free server',
                'description' => $ex->getMessage(),
            ]);

            throw new DisplayException('Unable to create server: ' . $ex->getMessage());
        }

        return $server;
    }

    /**
     * Run checks to validate that a free server meets criteria.
     */
    public function validate(Product $product, User $user, ?Node $node, bool $is_new_order): void
    {
        if ($is_new_order) {
            if (!$node->exists()) {
                throw new DisplayException('A valid node must be assigned for deployment.');
            }

            if (!$node->deployable_free) {
                throw new DisplayException('Free servers cannot be deployed to this node.');
            }

            if ($node->deployment_fee > 0) {
                throw new DisplayException('This node has a deployment fee and cannot be used for free servers.');
            }

            if ($user->servers()->where('billing_product_id', $product->id)->count() > 0) {
                throw new DisplayException('You already own one of this free product and cannot have multiple.');
            }
        }

        if ($product->isPaid()) {
            throw new DisplayException('This package is paid and cannot be deployed for no cost.');
        }
    }
}
