<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Everest\Models\WebhookEvent;

class WebhookSeeder extends Seeder
{
    /**
     * List of webhook events.
     *
     * @var array
     */
    private $events;

    /**
     * WebhookSeeder constructor.
     */
    public function __construct()
    {
        $this->events = [
            'admin:ai:update',

            'admin:alert:update',

            'admin:api-keys:create',
            'admin:api-keys:delete',

            'admin:auth:module:enable',
            'admin:auth:module:disable',

            'admin:billing:update',
            'admin:billing:reset-keys',
            'admin:billing:exception-resolve',
            'admin:billing:exception-resolve-all',
            'admin:billing:categories:create',
            'admin:billing:categories:update',
            'admin:billing:categories:delete',
            'admin:billing:config:export',
            'admin:billing:config:import',
            'admin:billing:products:create',
            'admin:billing:products:update',
            'admin:billing:products:delete',

            'admin:database-hosts:create',
            'admin:database-hosts:update',
            'admin:database-hosts:delete',

            'admin:eggs:create',
            'admin:eggs:update',
            'admin:eggs:delete',
            'admin:eggs:export',

            'admin:link:create',
            'admin:link:update',
            'admin:link:delete',

            'admin:mounts:create',
            'admin:mounts:update',
            'admin:mounts:delete',

            'admin:nests:create',
            'admin:nests:import',
            'admin:nests:update',
            'admin:nests:delete',

            'admin:nodes:create',
            'admin:nodes:update',
            'admin:nodes:delete',

            'admin:servers:create',
            'admin:servers:update',
            'admin:servers:delete',

            'admin:tickets:create',
            'admin:tickets:update',
            'admin:tickets:settings',
            'admin:tickets:delete',

            'admin:users:create',
            'admin:users:update',
            'admin:users:suspend',
            'admin:users:delete',

            'admin:webhooks:update',
            'admin:webhooks:test',
        ];
    }

    /**
     * Run the seeder to add missing webhook events to the Panel.
     *
     * @throws \Everest\Exceptions\Model\DataValidationException
     */
    public function run()
    {
        $created = 0;
        $updated = 0;
        $this->command->alert('Seeding Webhook Events');

        foreach ($this->events as $event) {
            if (!WebhookEvent::where('key', $event)->exists()) {
                WebhookEvent::create([
                    'key' => $event,
                    'description' => 'The event ' . $event . ' was executed',
                    'enabled' => true,
                ]);

                ++$created;
                $this->command->info('Event ' . $event . ' was added');
            } else {
                ++$updated;
                $this->command->warn('Event ' . $event . ' already exists, skipping');
            }
        }

        $this->command->info('Created ' . $created . ' webhook events');
        $this->command->info('Skipped ' . $updated . ' webhook events');
        $this->command->info('---');
        $this->command->info('Verified ' . $created + $updated . ' webhook events');
    }
}
