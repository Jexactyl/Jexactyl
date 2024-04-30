<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Everest\Models\Egg;
use Everest\Models\Server;
use Illuminate\Http\Request;
use Everest\Models\EggVariable;
use Everest\Models\Billing\Product;
use Everest\Exceptions\DisplayException;
use Everest\Services\Servers\ServerCreationService;
use Everest\Transformers\Api\Client\ProductTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class ProductController extends ClientApiController
{
    public function __construct(
        private ServerCreationService $serverCreation,
    )
    {
        // todo(jex): make services for these functions
        // instead of having everything in this file.
        parent::__construct();
    }

    /**
     * Returns all the products that have been configured.
     */
    public function index(int $id): array
    {
        $products = Product::where('category_id', $id)->get();

        return $this->fractal->collection($products)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * View a specific product.
     */
    public function view(int $id)
    {
        $product = Product::findOrFail($id);

        return $this->fractal->item($product)
            ->transformWith(ProductTransformer::class)
            ->toArray();
    }

    /**
     * Order a new product.
     */
    public function order(Request $request, int $id): string
    {
        $product = Product::findOrFail($id);

        $server = $this->createServer($request, $product);

        return $this->generateStripeUrl($request, $server, $product);
    }

    /**
     * Get the Stripe Checkout URL for payment.
     */
    private function generateStripeUrl(Request $request, Server $server, Product $product): string
    {
        $session = $request
            ->user()
            ->newSubscription('default', $product->stripe_id)
            ->checkout([
                'success_url' => route('index'),
                'cancel_url' => route('index'),
            ])
            ->url;

        return $session;
    }

    /**
     * Create the new server model that will be used once payment is complete.
     */
    private function createServer(Request $request, Product $product): Server
    {
        $egg = Egg::findOrFail($product->category->egg_id);
        $environment = $this->getServerEnvironment($request, $egg->id);

        try {
            $server = $this->serverCreation->handle([
                // todo(jex): make function to determine node/allocation
                // maybe let users choose the node..?
                'node_id' => 1,
                'allocation_id' => 11,
                'egg_id' => $egg->id,
                'nest_id' => $product->category->nest_id,
                'environment' => $request->input('environment'),
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
    private function getServerEnvironment(Request $request, int $id): array
    {
        $variables = [];
        $default = EggVariable::where('egg_id', $id)->get();

        foreach ($request->all() as $variable) {
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
