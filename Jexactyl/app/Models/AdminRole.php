<?php

namespace Everest\Models;

use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $sort_id
 * @property array $permissions
 */
class AdminRole extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'admin_role';

    /**
     * The table associated with the model.
     */
    protected $table = 'admin_roles';

    /**
     * Fields that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'sort_id',
        'permissions',
        'color',
    ];

    /**
     * Cast values to correct type.
     */
    protected $casts = [
        'sort_id' => 'int',
        'permissions' => 'array',
    ];

    public static array $validationRules = [
        'name' => 'required|string|max:64',
        'description' => 'nullable|string|max:255',
        'sort_id' => 'sometimes|numeric',
        'permissions' => 'nullable|array',
        'color' => 'nullable|string',
    ];

    public $timestamps = false;

    /**
     * The list of constants from self::$permissions.
     */
    public const OVERVIEW_READ = 'overview.read';

    public const SETTINGS_READ = 'settings.read';
    public const SETTINGS_UPDATE = 'settings.update';

    public const ACTIVITY_READ = 'activity.read';

    public const API_READ = 'api.read';
    public const API_CREATE = 'api.create';
    public const API_DELETE = 'api.delete';

    public const AUTH_READ = 'auth.read';
    public const AUTH_CREATE = 'auth.create';
    public const AUTH_UPDATE = 'auth.update';
    public const AUTH_DELETE = 'auth.delete';

    public const BILLING_READ = 'billing.read';
    public const BILLING_PRODUCTS_CREATE = 'billing.product-create';
    public const BILLING_PRODUCTS_UPDATE = 'billing.product-update';
    public const BILLING_PRODUCTS_DELETE = 'billing.product-delete';
    public const BILLING_CATEGORIES_CREATE = 'billing.category-create';
    public const BILLING_CATEGORIES_UPDATE = 'billing.category-update';
    public const BILLING_CATEGORIES_DELETE = 'billing.category-delete';
    public const BILLING_ORDERS = 'billing.orders';
    public const BILLING_EXCEPTIONS = 'billing.exceptions';
    public const BILLING_UPDATE = 'billing.update';
    public const BILLING_EXPORT = 'billing.export';
    public const BILLING_IMPORT = 'billing.import';
    public const BILLING_DELETE_KEYS = 'billing.delete-keys';

    public const TICKETS_READ = 'tickets.read';
    public const TICKETS_CREATE = 'tickets.create';
    public const TICKETS_UPDATE = 'tickets.update';
    public const TICKETS_DELETE = 'tickets.delete';
    public const TICKETS_MESSAGE = 'tickets.message';

    public const AI_READ = 'ai.read';
    public const AI_UPDATE = 'ai.update';

    public const WEBHOOKS_READ = 'webhooks.read';
    public const WEBHOOKS_UPDATE = 'webhooks.update';

    public const ALERTS_READ = 'alerts.read';
    public const ALERTS_UPDATE = 'alerts.update';

    public const THEME_READ = 'theme.read';
    public const THEME_UPDATE = 'theme.update';

    public const LINKS_READ = 'links.read';
    public const LINKS_CREATE = 'links.create';
    public const LINKS_UPDATE = 'links.update';
    public const LINKS_DELETE = 'links.delete';

    public const DATABASES_READ = 'databases.read';
    public const DATABASES_CREATE = 'databases.create';
    public const DATABASES_UPDATE = 'databases.update';
    public const DATABASES_DELETE = 'databases.delete';

    public const NODES_READ = 'nodes.read';
    public const NODES_CREATE = 'nodes.create';
    public const NODES_UPDATE = 'nodes.update';
    public const NODES_DELETE = 'nodes.delete';

    public const SERVERS_READ = 'servers.read';
    public const SERVERS_CREATE = 'servers.create';
    public const SERVERS_UPDATE = 'servers.update';
    public const SERVERS_DELETE = 'servers.delete';

    public const USERS_READ = 'users.read';
    public const USERS_CREATE = 'users.create';
    public const USERS_UPDATE = 'users.update';
    public const USERS_DELETE = 'users.delete';

    public const ROLES_READ = 'roles.read';
    public const ROLES_CREATE = 'roles.create';
    public const ROLES_UPDATE = 'roles.update';
    public const ROLES_DELETE = 'roles.delete';

    public const NESTS_READ = 'nests.read';
    public const NESTS_CREATE = 'nests.create';
    public const NESTS_UPDATE = 'nests.update';
    public const NESTS_DELETE = 'nests.delete';

    public const EGGS_READ = 'eggs.read';
    public const EGGS_CREATE = 'eggs.create';
    public const EGGS_UPDATE = 'eggs.update';
    public const EGGS_DELETE = 'eggs.delete';
    public const EGGS_IMPORT = 'eggs.import';
    public const EGGS_EXPORT = 'eggs.export';

    public const MOUNTS_READ = 'mounts.read';
    public const MOUNTS_CREATE = 'mounts.create';
    public const MOUNTS_UPDATE = 'mounts.update';
    public const MOUNTS_DELETE = 'mounts.delete';

    /**
     * All the permissions available on the system. You should use self::permissions()
     * to retrieve them, and not directly access this array as it is subject to change.
     *
     * @see \Everest\Models\Permission::permissions()
     */
    protected static array $permissions = [
        'overview' => [
            'description' => 'Permissions to allow administrator to view the index page.',
            'keys' => [
                'read' => 'Read the contents of the overview.',
            ],
        ],
        'settings' => [
            'description' => 'Permissions to allow changing basic admin settings.',
            'keys' => [
                'read' => 'Read the panel settings.',
                'update' => 'Update the panel settings.',
            ],
        ],
        'activity' => [
            'description' => 'Permissions to allow admins to see activity logs.',
            'keys' => [
                'read' => 'View the admin activity logs.',
            ],
        ],
        'api' => [
            'description' => 'Permissions to configure Application API keys.',
            'keys' => [
                'read' => 'View the existing Application API keys.',
                'create' => 'Create a new Application API key.',
                'delete' => 'Delete Application API keys.',
            ],
        ],
        'auth' => [
            'description' => 'Permissions to configure the Authentication module.',
            'keys' => [
                'read' => 'View the current authentication settings.',
                'create' => 'Enable authentication modules.',
                'update' => 'Update authentication module settings.',
                'delete' => 'Disable authentication modules.',
            ],
        ],
        'billing' => [
            'description' => 'Permissions to configure the Billing module.',
            'keys' => [
                'read' => 'Read basic billing information.',
                'orders' => 'Read all user orders on the system.',
                'products-create' => 'Create a billing product.',
                'products-update' => 'Update a billing product.',
                'products-delete' => 'Delete a billing product.',
                'categories-create' => 'Create a billing category.',
                'categories-update' => 'Update a billing category.',
                'categories-delete' => 'Delete a billing category.',
                'exceptions' => 'Manage and resolve billing exceptions.',
                'update' => 'Update billing settings.',
                'export' => 'Export current billing configuration to JSON.',
                'import' => 'Import current billing configuration from JSON.',
                'delete-keys' => 'Delete Stripe API billing keys used for payment.',
            ],
        ],
        'tickets' => [
            'description' => 'Permissions to configure the Ticket module.',
            'keys' => [
                'read' => 'View all existing tickets.',
                'create' => 'Create a new ticket.',
                'update' => 'Update an existing ticket.',
                'delete' => 'Delete an existing ticket.',
                'message' => 'Send a message in a ticket.',
            ],
        ],
        'ai' => [
            'description' => 'Permissions to configure the AI module.',
            'keys' => [
                'read' => 'View the Admin AI console.',
                'update' => 'Control the AI settings.',
            ],
        ],
        'webhooks' => [
            'description' => 'Permissions to configure the Webhook system.',
            'keys' => [
                'read' => 'View all available webhooks.',
                'update' => 'Control the AI settings.',
            ],
        ],
        'alerts' => [
            'description' => 'Permissions to configure Alerts.',
            'keys' => [
                'read' => 'View the alert configuration.',
                'update' => 'Control the alert settings.',
            ],
        ],
        'theme' => [
            'description' => 'Permissions to configure the panel theme.',
            'keys' => [
                'read' => 'View the current theme settings.',
                'update' => 'Adjust the panel theme.',
            ],
        ],
        'links' => [
            'description' => 'Permissions to configure external links.',
            'keys' => [
                'read' => 'View the current links.',
                'create' => 'Create a new link.',
                'update' => 'Update an existing link.',
                'delete' => 'Delete an existing link.',
            ],
        ],
        'databases' => [
            'description' => 'Permissions to configure database hosts.',
            'keys' => [
                'read' => 'View the current database hosts.',
                'create' => 'Create a new database host.',
                'update' => 'Update an existing database host.',
                'delete' => 'Delete an existing database host.',
            ],
        ],
        'nodes' => [
            'description' => 'Permissions to configure nodes.',
            'keys' => [
                'read' => 'View the current nodes.',
                'create' => 'Create a new node.',
                'update' => 'Update an existing node.',
                'delete' => 'Delete an existing node.',
            ],
        ],
        'servers' => [
            'description' => 'Permissions to configure servers.',
            'keys' => [
                'read' => 'View the current servers.',
                'create' => 'Create a new server.',
                'update' => 'Update an existing server.',
                'delete' => 'Delete an existing server.',
            ],
        ],
        'users' => [
            'description' => 'Permissions to configure users.',
            'keys' => [
                'read' => 'View the current users.',
                'create' => 'Create a new user.',
                'update' => 'Update an existing user.',
                'delete' => 'Delete an existing user.',
            ],
        ],
        'roles' => [
            'description' => 'Permissions to configure admin roles.',
            'keys' => [
                'read' => 'View the current admin roles.',
                'create' => 'Create a new admin role.',
                'update' => 'Update an existing admin role.',
                'delete' => 'Delete an existing admin role.',
            ],
        ],
        'nests' => [
            'description' => 'Permissions to configure nests.',
            'keys' => [
                'read' => 'View the current nests.',
                'create' => 'Create a new nest.',
                'update' => 'Update an existing nest.',
                'delete' => 'Delete an existing nest.',
            ],
        ],
        'eggs' => [
            'description' => 'Permissions to configure eggs.',
            'keys' => [
                'read' => 'View the current eggs.',
                'create' => 'Create a new egg.',
                'update' => 'Update an existing egg.',
                'delete' => 'Delete an existing egg.',
                'import' => 'Import an egg to an existing nest via JSON.',
                'export' => 'Export an egg via JSON.',
            ],
        ],
        'mounts' => [
            'description' => 'Permissions to configure mounts.',
            'keys' => [
                'read' => 'View the current mounts.',
                'create' => 'Create a new mount.',
                'update' => 'Update an existing mount.',
                'delete' => 'Delete an existing mount.',
            ],
        ],
    ];

    /**
     * Gets the permissions associated with an admin role.
     */
    public static function permissions(): Collection
    {
        return Collection::make(self::$permissions);
    }
}
