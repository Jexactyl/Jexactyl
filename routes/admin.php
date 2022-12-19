<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Admin;
use Pterodactyl\Http\Controllers\Admin\Jexactyl;
use Pterodactyl\Http\Middleware\Admin\Servers\ServerInstalled;

/*
|--------------------------------------------------------------------------
| Admin Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin
|
*/
Route::group(['prefix' => '/'], function () {
    Route::get('/', [Jexactyl\IndexController::class, 'index'])->name('admin.index');

    Route::group(['prefix' => '/appearance'], function () {
        Route::get('/', [Jexactyl\AppearanceController::class, 'index']);
        Route::patch('/', [Jexactyl\AppearanceController::class, 'update'])->name('admin.jexactyl.appearance');
    });

    Route::group(['prefix' => '/mail'], function () {
        Route::get('/', [Jexactyl\MailController::class, 'index']);
        Route::patch('/', [Jexactyl\MailController::class, 'update'])->name('admin.jexactyl.mail');
        Route::post('/test', [Jexactyl\MailController::class, 'test'])->name('admin.jexactyl.mail.test');
    });

    Route::group(['prefix' => '/advanced'], function () {
        Route::get('/', [Jexactyl\AdvancedController::class, 'index']);
        Route::patch('/', [Jexactyl\AdvancedController::class, 'update'])->name('admin.jexactyl.advanced');
    });

    Route::group(['prefix' => '/store'], function () {
        Route::get('/', [Jexactyl\StoreController::class, 'index']);
        Route::patch('/', [Jexactyl\StoreController::class, 'update'])->name('admin.jexactyl.store');
    });

    Route::group(['prefix' => '/registration'], function () {
        Route::get('/', [Jexactyl\RegistrationController::class, 'index']);
        Route::patch('/', [Jexactyl\RegistrationController::class, 'update'])->name('admin.jexactyl.registration');
    });

    Route::group(['prefix' => '/approvals'], function () {
        Route::get('/', [Jexactyl\ApprovalsController::class, 'index']);

        Route::post('/deny/{id}', [Jexactyl\ApprovalsController::class, 'deny'])->name('admin.jexactyl.approvals.deny');
        Route::post('/approve/all', [Jexactyl\ApprovalsController::class, 'approveAll'])->name('admin.jexactyl.approvals.all');
        Route::post('/approve/{id}', [Jexactyl\ApprovalsController::class, 'approve'])->name('admin.jexactyl.approvals.approve');
        Route::patch('/', [Jexactyl\ApprovalsController::class, 'update'])->name('admin.jexactyl.approvals');
    });

    Route::group(['prefix' => '/server'], function () {
        Route::get('/', [Jexactyl\ServerController::class, 'index']);
        Route::patch('/', [Jexactyl\ServerController::class, 'update'])->name('admin.jexactyl.server');
    });

    Route::group(['prefix' => '/referrals'], function () {
        Route::get('/', [Jexactyl\ReferralsController::class, 'index']);
        Route::patch('/', [Jexactyl\ReferralsController::class, 'update'])->name('admin.jexactyl.referrals');
    });

    Route::group(['prefix' => '/alerts'], function () {
        Route::get('/', [Jexactyl\AlertsController::class, 'index']);
        Route::patch('/', [Jexactyl\AlertsController::class, 'update'])->name('admin.jexactyl.alerts');
        Route::post('/remove', [Jexactyl\AlertsController::class, 'remove'])->name('admin.jexactyl.alerts.remove');
    });
});

/*
|--------------------------------------------------------------------------
| Ticket Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/tickets
|
*/
Route::group(['prefix' => 'tickets'], function () {
    Route::get('/', [Admin\TicketsController::class, 'index'])->name('admin.tickets.index');
});

/*
|--------------------------------------------------------------------------
| Location Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/api
|
*/
Route::group(['prefix' => 'api'], function () {
    Route::get('/', [Admin\ApiController::class, 'index'])->name('admin.api.index');
    Route::get('/new', [Admin\ApiController::class, 'create'])->name('admin.api.new');

    Route::post('/new', [Admin\ApiController::class, 'store']);

    Route::delete('/revoke/{identifier}', [Admin\ApiController::class, 'delete'])->name('admin.api.delete');
});

/*
|--------------------------------------------------------------------------
| Location Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/locations
|
*/
Route::group(['prefix' => 'locations'], function () {
    Route::get('/', [Admin\LocationController::class, 'index'])->name('admin.locations');
    Route::get('/view/{location:id}', [Admin\LocationController::class, 'view'])->name('admin.locations.view');

    Route::post('/', [Admin\LocationController::class, 'create']);
    Route::patch('/view/{location:id}', [Admin\LocationController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Database Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/databases
|
*/
Route::group(['prefix' => 'databases'], function () {
    Route::get('/', [Admin\DatabaseController::class, 'index'])->name('admin.databases');
    Route::get('/view/{host:id}', [Admin\DatabaseController::class, 'view'])->name('admin.databases.view');

    Route::post('/', [Admin\DatabaseController::class, 'create']);
    Route::patch('/view/{host:id}', [Admin\DatabaseController::class, 'update']);
    Route::delete('/view/{host:id}', [Admin\DatabaseController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Node Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/nodes
|
*/
Route::group(['prefix' => 'nodes'], function () {
    Route::get('/', [Admin\Nodes\NodeController::class, 'index'])->name('admin.nodes');
    Route::get('/new', [Admin\NodesController::class, 'create'])->name('admin.nodes.new');
    Route::get('/view/{node:id}', [Admin\Nodes\NodeViewController::class, 'index'])->name('admin.nodes.view');
    Route::get('/view/{node:id}/settings', [Admin\Nodes\NodeViewController::class, 'settings'])->name('admin.nodes.view.settings');
    Route::get('/view/{node:id}/configuration', [Admin\Nodes\NodeViewController::class, 'configuration'])->name('admin.nodes.view.configuration');
    Route::get('/view/{node:id}/allocation', [Admin\Nodes\NodeViewController::class, 'allocations'])->name('admin.nodes.view.allocation');
    Route::get('/view/{node:id}/servers', [Admin\Nodes\NodeViewController::class, 'servers'])->name('admin.nodes.view.servers');
    Route::get('/view/{node:id}/system-information', Admin\Nodes\SystemInformationController::class);

    Route::post('/new', [Admin\NodesController::class, 'store']);
    Route::post('/view/{node:id}/allocation', [Admin\NodesController::class, 'createAllocation']);
    Route::post('/view/{node:id}/allocation/remove', [Admin\NodesController::class, 'allocationRemoveBlock'])->name('admin.nodes.view.allocation.removeBlock');
    Route::post('/view/{node:id}/allocation/alias', [Admin\NodesController::class, 'allocationSetAlias'])->name('admin.nodes.view.allocation.setAlias');
    Route::post('/view/{node:id}/settings/token', Admin\NodeAutoDeployController::class)->name('admin.nodes.view.configuration.token');

    Route::patch('/view/{node:id}/settings', [Admin\NodesController::class, 'updateSettings']);

    Route::delete('/view/{node:id}/delete', [Admin\NodesController::class, 'delete'])->name('admin.nodes.view.delete');
    Route::delete('/view/{node:id}/allocation/remove/{allocation:id}', [Admin\NodesController::class, 'allocationRemoveSingle'])->name('admin.nodes.view.allocation.removeSingle');
    Route::delete('/view/{node:id}/allocations', [Admin\NodesController::class, 'allocationRemoveMultiple'])->name('admin.nodes.view.allocation.removeMultiple');
});

/*
|--------------------------------------------------------------------------
| Server Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/servers
|
*/
Route::group(['prefix' => 'servers'], function () {
    Route::get('/', [Admin\Servers\ServerController::class, 'index'])->name('admin.servers');
    Route::get('/new', [Admin\Servers\CreateServerController::class, 'index'])->name('admin.servers.new');
    Route::get('/view/{server:id}', [Admin\Servers\ServerViewController::class, 'index'])->name('admin.servers.view');

    Route::group(['middleware' => [ServerInstalled::class]], function () {
        Route::get('/view/{server:id}/details', [Admin\Servers\ServerViewController::class, 'details'])->name('admin.servers.view.details');
        Route::get('/view/{server:id}/build', [Admin\Servers\ServerViewController::class, 'build'])->name('admin.servers.view.build');
        Route::get('/view/{server:id}/startup', [Admin\Servers\ServerViewController::class, 'startup'])->name('admin.servers.view.startup');
        Route::get('/view/{server:id}/database', [Admin\Servers\ServerViewController::class, 'database'])->name('admin.servers.view.database');
        Route::get('/view/{server:id}/mounts', [Admin\Servers\ServerViewController::class, 'mounts'])->name('admin.servers.view.mounts');
    });

    Route::get('/view/{server:id}/manage', [Admin\Servers\ServerViewController::class, 'manage'])->name('admin.servers.view.manage');
    Route::get('/view/{server:id}/delete', [Admin\Servers\ServerViewController::class, 'delete'])->name('admin.servers.view.delete');

    Route::post('/new', [Admin\Servers\CreateServerController::class, 'store']);
    Route::post('/view/{server:id}/build', [Admin\ServersController::class, 'updateBuild']);
    Route::post('/view/{server:id}/startup', [Admin\ServersController::class, 'saveStartup']);
    Route::post('/view/{server:id}/database', [Admin\ServersController::class, 'newDatabase']);
    Route::post('/view/{server:id}/mounts', [Admin\ServersController::class, 'addMount'])->name('admin.servers.view.mounts.store');
    Route::post('/view/{server:id}/manage/toggle', [Admin\ServersController::class, 'toggleInstall'])->name('admin.servers.view.manage.toggle');
    Route::post('/view/{server:id}/manage/suspension', [Admin\ServersController::class, 'manageSuspension'])->name('admin.servers.view.manage.suspension');
    Route::post('/view/{server:id}/manage/reinstall', [Admin\ServersController::class, 'reinstallServer'])->name('admin.servers.view.manage.reinstall');
    Route::post('/view/{server:id}/manage/transfer', [Admin\Servers\ServerTransferController::class, 'transfer'])->name('admin.servers.view.manage.transfer');
    Route::post('/view/{server:id}/delete', [Admin\ServersController::class, 'delete']);

    Route::patch('/view/{server:id}/details', [Admin\ServersController::class, 'setDetails']);
    Route::patch('/view/{server:id}/database', [Admin\ServersController::class, 'resetDatabasePassword']);

    Route::delete('/view/{server:id}/database/{database:id}/delete', [Admin\ServersController::class, 'deleteDatabase'])->name('admin.servers.view.database.delete');
    Route::delete('/view/{server:id}/mounts/{mount:id}', [Admin\ServersController::class, 'deleteMount'])
        ->name('admin.servers.view.mounts.delete');
});

/*
|--------------------------------------------------------------------------
| User Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/users
|
*/
Route::group(['prefix' => 'users'], function () {
    Route::get('/', [Admin\Users\UserController::class, 'index'])->name('admin.users');
    Route::get('/accounts.json', [Admin\Users\UserController::class, 'json'])->name('admin.users.json');
    Route::get('/new', [Admin\Users\UserController::class, 'create'])->name('admin.users.new');
    Route::get('/view/{user:id}', [Admin\Users\UserController::class, 'view'])->name('admin.users.view');
    Route::get('/view/{user:id}/resources', [Admin\Users\ResourceController::class, 'view'])->name('admin.users.resources');

    Route::post('/new', [Admin\Users\UserController::class, 'store']);

    Route::patch('/view/{user:id}', [Admin\Users\UserController::class, 'update']);
    Route::patch('/view/{user:id}/resources', [Admin\Users\ResourceController::class, 'update']);

    Route::delete('/view/{user:id}', [Admin\Users\UserController::class, 'delete']);
});

/*
|--------------------------------------------------------------------------
| Mount Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/mounts
|
*/
Route::group(['prefix' => 'mounts'], function () {
    Route::get('/', [Admin\MountController::class, 'index'])->name('admin.mounts');
    Route::get('/view/{mount:id}', [Admin\MountController::class, 'view'])->name('admin.mounts.view');

    Route::post('/', [Admin\MountController::class, 'create']);
    Route::post('/{mount:id}/eggs', [Admin\MountController::class, 'addEggs'])->name('admin.mounts.eggs');
    Route::post('/{mount:id}/nodes', [Admin\MountController::class, 'addNodes'])->name('admin.mounts.nodes');

    Route::patch('/view/{mount:id}', [Admin\MountController::class, 'update']);

    Route::delete('/{mount:id}/eggs/{egg_id}', [Admin\MountController::class, 'deleteEgg']);
    Route::delete('/{mount:id}/nodes/{node_id}', [Admin\MountController::class, 'deleteNode']);
});

/*
|--------------------------------------------------------------------------
| Nest Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/nests
|
*/
Route::group(['prefix' => 'nests'], function () {
    Route::get('/', [Admin\Nests\NestController::class, 'index'])->name('admin.nests');
    Route::get('/new', [Admin\Nests\NestController::class, 'create'])->name('admin.nests.new');
    Route::get('/view/{nest:id}', [Admin\Nests\NestController::class, 'view'])->name('admin.nests.view');
    Route::get('/egg/new', [Admin\Nests\EggController::class, 'create'])->name('admin.nests.egg.new');
    Route::get('/egg/{egg:id}', [Admin\Nests\EggController::class, 'view'])->name('admin.nests.egg.view');
    Route::get('/egg/{egg:id}/export', [Admin\Nests\EggShareController::class, 'export'])->name('admin.nests.egg.export');
    Route::get('/egg/{egg:id}/variables', [Admin\Nests\EggVariableController::class, 'view'])->name('admin.nests.egg.variables');
    Route::get('/egg/{egg:id}/scripts', [Admin\Nests\EggScriptController::class, 'index'])->name('admin.nests.egg.scripts');

    Route::post('/new', [Admin\Nests\NestController::class, 'store']);
    Route::post('/import', [Admin\Nests\EggShareController::class, 'import'])->name('admin.nests.egg.import');
    Route::post('/egg/new', [Admin\Nests\EggController::class, 'store']);
    Route::post('/egg/{egg:id}/variables', [Admin\Nests\EggVariableController::class, 'store']);

    Route::put('/egg/{egg:id}', [Admin\Nests\EggShareController::class, 'update']);

    Route::patch('/view/{nest:id}', [Admin\Nests\NestController::class, 'update']);
    Route::patch('/egg/{egg:id}', [Admin\Nests\EggController::class, 'update']);
    Route::patch('/egg/{egg:id}/scripts', [Admin\Nests\EggScriptController::class, 'update']);
    Route::patch('/egg/{egg:id}/variables/{variable:id}', [Admin\Nests\EggVariableController::class, 'update'])->name('admin.nests.egg.variables.edit');

    Route::delete('/view/{nest:id}', [Admin\Nests\NestController::class, 'destroy']);
    Route::delete('/egg/{egg:id}', [Admin\Nests\EggController::class, 'destroy']);
    Route::delete('/egg/{egg:id}/variables/{variable:id}', [Admin\Nests\EggVariableController::class, 'destroy']);
});
