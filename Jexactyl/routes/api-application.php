<?php

use Illuminate\Support\Facades\Route;
use Everest\Http\Controllers\Api\Application;
use Everest\Http\Middleware\Activity\AdminSubject;

Route::middleware([AdminSubject::class])->group(function () {
    Route::get('/permissions', [Application\ApplicationApiController::class, 'adminPermissions']);

    Route::get('/overview/version', [Application\OverviewController::class, 'version']);
    Route::get('/overview/metrics', [Application\OverviewController::class, 'metrics']);

    Route::get('/activity', Application\ActivityLogController::class);

    Route::group(['prefix' => '/setup'], function () {
        Route::get('/data', [Application\Setup\SetupController::class, 'data']);
        Route::post('/finish', [Application\Setup\SetupController::class, 'finish']);
    });

    /*
    |--------------------------------------------------------------------------
    | Settings Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/settings
    |
    */
    Route::group(['prefix' => '/settings'], function () {
        Route::patch('/', [Application\Settings\GeneralController::class, 'update']);
        Route::patch('/mode', [Application\Settings\ModeController::class, 'update']);
    });

    /*
    |--------------------------------------------------------------------------
    | Auth Settings Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/auth
    |
    */
    Route::group(['prefix' => '/auth'], function () {
        Route::group(['prefix' => '/modules'], function () {
            Route::post('/enable', [Application\Auth\ModuleController::class, 'enable']);
            Route::post('/disable', [Application\Auth\ModuleController::class, 'disable']);

            Route::put('/', [Application\Auth\ModuleController::class, 'update']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Billing Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/billing
    |
    */
    Route::group(['prefix' => '/billing'], function () {
        Route::get('/analytics', [Application\Billing\BillingController::class, 'analytics']);
        Route::put('/settings', [Application\Billing\BillingController::class, 'settings']);

        Route::delete('/keys', [Application\Billing\BillingController::class, 'resetKeys']);

        Route::group(['prefix' => '/categories'], function () {
            Route::get('/', [Application\Billing\CategoryController::class, 'index']);
            Route::post('/', [Application\Billing\CategoryController::class, 'store']);

            Route::get('/{category:id}', [Application\Billing\CategoryController::class, 'view']);
            Route::patch('/{category:id}', [Application\Billing\CategoryController::class, 'update']);
            Route::delete('/{category:id}', [Application\Billing\CategoryController::class, 'delete']);

            Route::group(['prefix' => '/{category:id}/products'], function () {
                Route::get('/', [Application\Billing\ProductController::class, 'index']);
                Route::post('/', [Application\Billing\ProductController::class, 'store']);

                Route::get('/{product:id}', [Application\Billing\ProductController::class, 'view']);
                Route::patch('/{product:id}', [Application\Billing\ProductController::class, 'update']);
                Route::delete('/{product:id}', [Application\Billing\ProductController::class, 'delete']);
            });
        });

        Route::group(['prefix' => '/orders'], function () {
            Route::get('/', [Application\Billing\OrderController::class, 'index']);
        });

        Route::group(['prefix' => '/exceptions'], function () {
            Route::get('/', [Application\Billing\BillingExceptionController::class, 'index']);

            Route::delete('/', [Application\Billing\BillingExceptionController::class, 'resolveAll']);
            Route::delete('/{uuid}', [Application\Billing\BillingExceptionController::class, 'resolve']);
        });

        Route::prefix('/config')->group(function () {
            Route::post('/import', [Application\Billing\ConfigController::class, 'import']);
            Route::post('/export', [Application\Billing\ConfigController::class, 'export']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | AI Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/ai
    |
    */
    Route::group(['prefix' => '/ai'], function () {
        Route::put('/settings', [Application\IntelligenceController::class, 'update']);
        Route::post('/query', [Application\IntelligenceController::class, 'query']);
    });

    /*
    |--------------------------------------------------------------------------
    | Webhook Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/webhooks
    |
    */
    Route::group(['prefix' => '/webhooks'], function () {
        Route::get('/', [Application\Webhooks\WebhookController::class, 'index']);
        Route::put('/', [Application\Webhooks\WebhookController::class, 'settings']);

        Route::post('/test', [Application\Webhooks\WebhookController::class, 'test']);
        Route::put('/toggle', [Application\Webhooks\WebhookController::class, 'toggle']);
    });

    /*
    |--------------------------------------------------------------------------
    | API Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/api
    |
    */
    Route::group(['prefix' => '/api'], function () {
        Route::get('/', [Application\Api\ApiController::class, 'index']);
        Route::post('/', [Application\Api\ApiController::class, 'store']);
        Route::delete('/{key:id}', [Application\Api\ApiController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Tickets Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/tickets
    |
    */
    Route::group(['prefix' => '/tickets'], function () {
        Route::get('/', [Application\Tickets\TicketController::class, 'index']);
        Route::post('/', [Application\Tickets\TicketController::class, 'store']);
        Route::put('/settings', [Application\Tickets\TicketController::class, 'settings']);

        Route::get('/{ticket:id}', [Application\Tickets\TicketController::class, 'view']);
        Route::put('/{ticket:id}', [Application\Tickets\TicketController::class, 'update']);
        Route::delete('/{ticket:id}', [Application\Tickets\TicketController::class, 'delete']);

        Route::post('/message', [Application\Tickets\TicketMessageController::class, 'store']);
        Route::get('/{ticket:id}/messages', [Application\Tickets\TicketMessageController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Alerts Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/alerts
    |
    */
    Route::group(['prefix' => '/alerts'], function () {
        Route::patch('/', [Application\Alerts\AlertController::class, 'update']);
    });

    /*
    |--------------------------------------------------------------------------
    | Theme controller routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/theme
    |
    */
    Route::group(['prefix' => '/theme'], function () {
        Route::put('/colors', [Application\Theme\ThemeController::class, 'colors']);

        Route::post('/reset', [Application\Theme\ThemeController::class, 'reset']);
    });

    /*
    |--------------------------------------------------------------------------
    | Link controller routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/links
    |
    */
    Route::group(['prefix' => '/links'], function () {
        Route::get('/', [Application\Links\LinkController::class, 'index']);
        Route::post('/', [Application\Links\LinkController::class, 'store']);

        Route::patch('/{id}', [Application\Links\LinkController::class, 'update']);
        Route::delete('/{id}', [Application\Links\LinkController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Database Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/databases
    |
    */
    Route::group(['prefix' => '/databases'], function () {
        Route::get('/', [Application\Databases\DatabaseController::class, 'index']);
        Route::get('/{databaseHost:id}', [Application\Databases\DatabaseController::class, 'view']);

        Route::post('/', [Application\Databases\DatabaseController::class, 'store']);

        Route::patch('/{databaseHost:id}', [Application\Databases\DatabaseController::class, 'update']);

        Route::delete('/{databaseHost:id}', [Application\Databases\DatabaseController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Egg Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/eggs
    |
    */
    Route::group(['prefix' => '/eggs'], function () {
        Route::get('/{egg:id}', [Application\Eggs\EggController::class, 'view']);
        Route::get('/{egg:id}/export', [Application\Eggs\EggController::class, 'export']);

        Route::post('/', [Application\Eggs\EggController::class, 'store']);
        Route::post('/{egg:id}/variables', [Application\Eggs\EggVariableController::class, 'store']);

        Route::patch('/{egg:id}', [Application\Eggs\EggController::class, 'update']);
        Route::patch('/{egg:id}/variables', [Application\Eggs\EggVariableController::class, 'update']);

        Route::delete('/{egg:id}', [Application\Eggs\EggController::class, 'delete']);
        Route::delete('/{egg:id}/variables/{eggVariable:id}', [Application\Eggs\EggVariableController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Nest Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/nests
    |
    */
    Route::group(['prefix' => '/nests'], function () {
        Route::get('/', [Application\Nests\NestController::class, 'index']);
        Route::get('/{nest:id}', [Application\Nests\NestController::class, 'view']);
        Route::get('/{nest:id}/eggs', [Application\Eggs\EggController::class, 'index']);

        Route::post('/', [Application\Nests\NestController::class, 'store']);
        Route::post('/{nest:id}/import', [Application\Nests\NestController::class, 'import']);

        Route::patch('/{nest:id}', [Application\Nests\NestController::class, 'update']);

        Route::delete('/{nest:id}', [Application\Nests\NestController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Node Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/nodes
    |
    */
    Route::group(['prefix' => '/nodes'], function () {
        Route::get('/', [Application\Nodes\NodeController::class, 'index']);
        Route::get('/deployable', [Application\Nodes\NodeDeploymentController::class, '__invoke']);
        Route::get('/{node:id}', [Application\Nodes\NodeController::class, 'view']);
        Route::get('/{node:id}/configuration', [Application\Nodes\NodeConfigurationController::class, '__invoke']);
        Route::get('/{node:id}/information', [Application\Nodes\NodeInformationController::class, 'information']);
        Route::get('/{node:id}/utilization', [Application\Nodes\NodeInformationController::class, 'utilization']);

        Route::post('/', [Application\Nodes\NodeController::class, 'store']);

        Route::patch('/{node:id}', [Application\Nodes\NodeController::class, 'update']);

        Route::delete('/{node:id}', [Application\Nodes\NodeController::class, 'delete']);

        Route::group(['prefix' => '/{node:id}/allocations'], function () {
            Route::get('/', [Application\Nodes\AllocationController::class, 'index']);
            Route::post('/', [Application\Nodes\AllocationController::class, 'store']);
            Route::delete('/', [Application\Nodes\AllocationController::class, 'deleteAll']);
            Route::delete('/{allocation:id}', [Application\Nodes\AllocationController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Server Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/servers
    |
    */
    Route::group(['prefix' => '/servers'], function () {
        Route::get('/', [Application\Servers\ServerController::class, 'index']);
        Route::get('/{server:id}', [Application\Servers\ServerController::class, 'view']);
        Route::get('/external/{external_id}', [Application\Servers\ExternalServerController::class, 'index']);

        Route::patch('/{server:id}', [Application\Servers\ServerController::class, 'update']);
        Route::patch('/{server:id}/startup', [Application\Servers\StartupController::class, 'index']);

        Route::post('/', [Application\Servers\ServerController::class, 'store']);
        Route::post('/{server:id}/toggle', [Application\Servers\ServerManagementController::class, 'toggle']);
        Route::post('/{server:id}/suspend', [Application\Servers\ServerManagementController::class, 'suspend']);
        Route::post('/{server:id}/unsuspend', [Application\Servers\ServerManagementController::class, 'unsuspend']);
        Route::post('/{server:id}/reinstall', [Application\Servers\ServerManagementController::class, 'reinstall']);

        Route::post('/{server:id}/delete', [Application\Servers\ServerController::class, 'delete']);

        // Database Management Endpoint
        Route::group(['prefix' => '/{server:id}/databases'], function () {
            Route::get('/', [Application\Servers\DatabaseController::class, 'index']);
            Route::get('/{database:id}', [Application\Servers\DatabaseController::class, 'view']);

            Route::post('/', [Application\Servers\DatabaseController::class, 'store']);
            Route::post('/{database:id}/reset-password', [Application\Servers\DatabaseController::class, 'resetPassword']);

            Route::delete('/{database:id}', [Application\Servers\DatabaseController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | User Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/users
    |
    */
    Route::group(['prefix' => '/users'], function () {
        Route::get('/', [Application\Users\UserController::class, 'index']);
        Route::get('/{user:id}', [Application\Users\UserController::class, 'view']);
        Route::get('/external/{external_id}', [Application\Users\ExternalUserController::class, 'index']);

        Route::post('/', [Application\Users\UserController::class, 'store']);
        Route::post('/{user:id}/suspend', [Application\Users\UserController::class, 'suspend']);

        Route::patch('/{user:id}', [Application\Users\UserController::class, 'update']);

        Route::delete('/{user:id}', [Application\Users\UserController::class, 'delete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Role Controller Routes
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/application/roles
    |
    */
    Route::group(['prefix' => '/roles'], function () {
        Route::get('/', [Application\Roles\RoleController::class, 'index']);
        Route::get('/permissions', [Application\Roles\RoleController::class, 'permissions']);
        Route::get('/{role:id}', [Application\Roles\RoleController::class, 'view']);

        Route::post('/', [Application\Roles\RoleController::class, 'store']);

        Route::patch('/{role:id}', [Application\Roles\RoleController::class, 'update']);
        Route::patch('/{role:id}/permissions', [Application\Roles\RoleController::class, 'updatePermissions']);

        Route::delete('/{role:id}', [Application\Roles\RoleController::class, 'delete']);
    });
});
