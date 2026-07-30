<?php

use Illuminate\Support\Facades\Route;
use Everest\Http\Controllers\Api\Client;
use Everest\Http\Middleware\BillingEnabled;
use Everest\Http\Middleware\SuspendedAccount;
use Everest\Http\Middleware\Activity\ServerSubject;
use Everest\Http\Middleware\Activity\AccountSubject;
use Everest\Http\Middleware\RequireTwoFactorAuthentication;
use Everest\Http\Middleware\Api\Client\Server\BillingUpgradesEnabled;
use Everest\Http\Middleware\Api\Client\Server\ResourceBelongsToServer;
use Everest\Http\Middleware\Api\Client\Server\AuthenticateServerAccess;

/*
|--------------------------------------------------------------------------
| Client Control API
|--------------------------------------------------------------------------
|
| Endpoint: /api/client
|
*/

Route::prefix('/')->middleware([SuspendedAccount::class])->group(function () {
    Route::get('/', [Client\ClientController::class, 'index'])->name('api:client.index');
    Route::get('/permissions', [Client\ClientController::class, 'permissions']);
    Route::get('links', [Client\LinkController::class, 'index']);

    Route::prefix('/groups')->group(function () {
        Route::get('/', [Client\ServerGroupController::class, 'index']);
        Route::post('/', [Client\ServerGroupController::class, 'store']);

        Route::patch('/{id}', [Client\ServerGroupController::class, 'update']);
        Route::delete('/{id}', [Client\ServerGroupController::class, 'delete']);

        Route::post('/{id}/add', [Client\ServerGroupController::class, 'add']);
        Route::post('/{id}/remove', [Client\ServerGroupController::class, 'remove']);
    });

    Route::prefix('/account')->middleware(AccountSubject::class)->group(function () {
        Route::prefix('/')->withoutMiddleware(RequireTwoFactorAuthentication::class)->group(function () {
            Route::get('/', [Client\AccountController::class, 'index'])->name('api:client.account');
            Route::get('/two-factor', [Client\TwoFactorController::class, 'index']);
            Route::post('/two-factor', [Client\TwoFactorController::class, 'store']);
            Route::post('/two-factor/disable', [Client\TwoFactorController::class, 'delete']);
        });

        Route::put('/email', [Client\AccountController::class, 'updateEmail'])->name('api:client.account.update-email');
        Route::put('/password', [Client\AccountController::class, 'updatePassword'])->name('api:client.account.update-password');
        Route::post('/avatar', [Client\AccountController::class, 'updateAvatar'])->name('api:client.account.update-avatar');
        Route::delete('/avatar', [Client\AccountController::class, 'removeAvatar'])->name('api:client.account.remove-avatar');

        Route::get('/activity', Client\ActivityLogController::class)->name('api:client.account.activity');

        Route::get('/api-keys', [Client\ApiKeyController::class, 'index']);
        Route::post('/api-keys', [Client\ApiKeyController::class, 'store']);
        Route::delete('/api-keys/{identifier}', [Client\ApiKeyController::class, 'delete']);

        Route::prefix('/ssh-keys')->group(function () {
            Route::get('/', [Client\SSHKeyController::class, 'index']);
            Route::post('/', [Client\SSHKeyController::class, 'store']);
            Route::post('/remove', [Client\SSHKeyController::class, 'delete']);
        });

        Route::prefix('/tickets')->group(function () {
            Route::get('/', [Client\TicketController::class, 'index']);
            Route::post('/', [Client\TicketController::class, 'store']);

            Route::get('/{ticket:id}', [Client\TicketController::class, 'view']);
            Route::delete('/{ticket:id}', [Client\TicketController::class, 'delete']);
            Route::post('/{ticket:id}/messages', [Client\TicketController::class, 'message']);
        });

        Route::post('/setup', [Client\AccountController::class, 'setup']);
    });

    Route::prefix('/billing')->middleware([BillingEnabled::class])->group(function () {
        // Data for storefront checkout
        Route::post('/nodes/{product:id}', [Client\Billing\StoreController::class, 'nodes']);
        Route::get('/categories', [Client\Billing\StoreController::class, 'categories']);

        // Discount code checking
        Route::post('/discount-codes', [Client\Billing\DiscountCodeController::class, 'index']);

        // Viewing of available categories/products
        Route::get('/categories/{category:id}', [Client\Billing\StoreController::class, 'products']);
        Route::get('/products/{product:id}', [Client\Billing\StoreController::class, 'product']);
        Route::get('/products/{product:id}/eggs', [Client\Billing\StoreController::class, 'eggs']);
        Route::get('/products/{egg:id}/variables', [Client\Billing\StoreController::class, 'variables']);

        // View existing billing orders that have already been created
        Route::get('/orders', [Client\Billing\OrderController::class, 'index']);
        Route::get('/orders/{order:id}', [Client\Billing\OrderController::class, 'view']);
        Route::get('/orders/{order:id}/invoice', [Client\Billing\OrderController::class, 'invoice']);

        // Billing controllers and services
        Route::post('/stripe/create', [Client\Billing\StripeController::class, 'create']);
        Route::post('/stripe/process', [Client\Billing\StripeController::class, 'process']);

        Route::post('/free/process', [Client\Billing\FreeProductController::class, 'process']);
    });

    /*
    |--------------------------------------------------------------------------
    | Client Control API
    |--------------------------------------------------------------------------
    |
    | Endpoint: /api/client/servers/{server}
    |
    */
    Route::group([
        'prefix' => '/servers/{server}',
        'middleware' => [
            ServerSubject::class,
            AuthenticateServerAccess::class,
            ResourceBelongsToServer::class,
        ],
    ], function () {
        Route::get('/', [Client\Servers\ServerController::class, 'index'])->name('api:client:server.view');
        Route::get('/websocket', Client\Servers\WebsocketController::class)->name('api:client:server.ws');
        Route::get('/resources', Client\Servers\ResourceUtilizationController::class)->name('api:client:server.resources');
        Route::get('/activity', Client\Servers\ActivityLogController::class)->name('api:client:server.activity');

        Route::post('/command', [Client\Servers\CommandController::class, 'index']);
        Route::post('/power', [Client\Servers\PowerController::class, 'index']);
        Route::post('/ai', [Client\Servers\AIController::class, 'index']);

        Route::group(['prefix' => '/databases'], function () {
            Route::get('/', [Client\Servers\DatabaseController::class, 'index']);
            Route::post('/', [Client\Servers\DatabaseController::class, 'store']);
            Route::post('/{database}/rotate-password', [Client\Servers\DatabaseController::class, 'rotatePassword']);
            Route::delete('/{database}', [Client\Servers\DatabaseController::class, 'delete']);
        });

        Route::group(['prefix' => '/files'], function () {
            Route::get('/list', [Client\Servers\FileController::class, 'directory']);
            Route::get('/contents', [Client\Servers\FileController::class, 'contents']);
            Route::get('/download', [Client\Servers\FileController::class, 'download']);
            Route::put('/rename', [Client\Servers\FileController::class, 'rename']);
            Route::post('/copy', [Client\Servers\FileController::class, 'copy']);
            Route::post('/write', [Client\Servers\FileController::class, 'write']);
            Route::post('/compress', [Client\Servers\FileController::class, 'compress']);
            Route::post('/decompress', [Client\Servers\FileController::class, 'decompress']);
            Route::post('/delete', [Client\Servers\FileController::class, 'delete']);
            Route::post('/create-folder', [Client\Servers\FileController::class, 'create']);
            Route::post('/chmod', [Client\Servers\FileController::class, 'chmod']);
            Route::post('/pull', [Client\Servers\FileController::class, 'pull'])->middleware(['throttle:10,5']);
            Route::get('/upload', Client\Servers\FileUploadController::class);
        });

        Route::group(['prefix' => '/schedules'], function () {
            Route::get('/', [Client\Servers\ScheduleController::class, 'index']);
            Route::post('/', [Client\Servers\ScheduleController::class, 'store']);
            Route::get('/{schedule}', [Client\Servers\ScheduleController::class, 'view']);
            Route::post('/{schedule}', [Client\Servers\ScheduleController::class, 'update']);
            Route::post('/{schedule}/execute', [Client\Servers\ScheduleController::class, 'execute']);
            Route::delete('/{schedule}', [Client\Servers\ScheduleController::class, 'delete']);

            Route::post('/{schedule}/tasks', [Client\Servers\ScheduleTaskController::class, 'store']);
            Route::post('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'update']);
            Route::delete('/{schedule}/tasks/{task}', [Client\Servers\ScheduleTaskController::class, 'delete']);
        });

        Route::group(['prefix' => '/network'], function () {
            Route::get('/allocations', [Client\Servers\NetworkAllocationController::class, 'index']);
            Route::post('/allocations', [Client\Servers\NetworkAllocationController::class, 'store']);
            Route::post('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'update']);
            Route::post('/allocations/{allocation}/primary', [Client\Servers\NetworkAllocationController::class, 'setPrimary']);
            Route::delete('/allocations/{allocation}', [Client\Servers\NetworkAllocationController::class, 'delete']);
        });

        Route::group(['prefix' => '/users'], function () {
            Route::get('/', [Client\Servers\SubuserController::class, 'index']);
            Route::post('/', [Client\Servers\SubuserController::class, 'store']);
            Route::get('/{user}', [Client\Servers\SubuserController::class, 'view']);
            Route::post('/{user}', [Client\Servers\SubuserController::class, 'update']);
            Route::delete('/{user}', [Client\Servers\SubuserController::class, 'delete']);
        });

        Route::group(['prefix' => '/backups'], function () {
            Route::get('/', [Client\Servers\BackupController::class, 'index']);
            Route::post('/', [Client\Servers\BackupController::class, 'store']);
            Route::get('/{backup}', [Client\Servers\BackupController::class, 'view']);
            Route::get('/{backup}/download', [Client\Servers\BackupController::class, 'download']);
            Route::post('/{backup}/lock', [Client\Servers\BackupController::class, 'toggleLock']);
            Route::post('/{backup}/restore', [Client\Servers\BackupController::class, 'restore']);
            Route::delete('/{backup}', [Client\Servers\BackupController::class, 'delete']);
        });

        Route::group(['prefix' => '/startup'], function () {
            Route::get('/', [Client\Servers\StartupController::class, 'index']);
            Route::put('/variable', [Client\Servers\StartupController::class, 'update']);
        });

        Route::group(['prefix' => '/settings'], function () {
            Route::post('/rename', [Client\Servers\SettingsController::class, 'rename']);
            Route::post('/reinstall', [Client\Servers\SettingsController::class, 'reinstall']);
            Route::put('/docker-image', [Client\Servers\SettingsController::class, 'dockerImage']);
        });

        Route::prefix('/upgrade')
            ->middleware([BillingEnabled::class, BillingUpgradesEnabled::class])
            ->group(function () {
                Route::get('/', [Client\Billing\UpgradeController::class, 'index']);
                Route::post('/', [Client\Billing\UpgradeController::class, 'create']);
                Route::post('/charge', [Client\Billing\UpgradeController::class, 'charge']);
            });
    });
});
