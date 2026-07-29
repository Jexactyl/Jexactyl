<?php

namespace Everest\Http\Controllers\Api\Application\Servers;

use Everest\Models\Server;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Services\Servers\SuspensionService;
use Everest\Services\Servers\ServerTransferService;
use Everest\Services\Servers\ReinstallServerService;
use Everest\Repositories\Wings\DaemonPowerRepository;
use Everest\Http\Requests\Api\Application\Servers\ServerWriteRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Servers\ServerToggleRequest;
use Everest\Http\Requests\Api\Application\Servers\TransferServerRequest;
use Everest\Exceptions\Http\Connection\DaemonConnectionException;
use Everest\Http\Requests\Api\Application\Servers\BulkPowerActionRequest;

class ServerManagementController extends ApplicationApiController
{
    /**
     * SuspensionController constructor.
     */
    public function __construct(
        private ReinstallServerService $reinstallServerService,
        private SuspensionService $suspensionService,
        private ServerTransferService $transferService,
        private DaemonPowerRepository $powerRepository,
    ) {
        parent::__construct();
    }

    /**
     * Suspend a server on the Panel.
     *
     * @throws \Throwable
     */
    public function suspend(ServerWriteRequest $request, Server $server): Response
    {
        $this->suspensionService->toggle($server);

        Activity::event('admin:servers:suspend')
            ->subject($server)
            ->property('server', $server)
            ->description('A server was suspended')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Unsuspend a server on the Panel.
     *
     * @throws \Throwable
     */
    public function unsuspend(ServerWriteRequest $request, Server $server): Response
    {
        $this->suspensionService->toggle($server, SuspensionService::ACTION_UNSUSPEND);

        Activity::event('admin:servers:unsuspend')
            ->subject($server)
            ->property('server', $server)
            ->description('A server was unsuspended')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Mark a server as needing to be reinstalled.
     *
     * @throws \Throwable
     */
    public function reinstall(ServerWriteRequest $request, Server $server): Response
    {
        $this->reinstallServerService->handle($server);

        Activity::event('admin:servers:reinstall')
            ->subject($server)
            ->property('server', $server)
            ->description('A server was marked for reinstallation')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Toggles the installation status for a server.
     *
     * @throws \Throwable
     */
    public function toggle(ServerToggleRequest $request, Server $server): Response
    {
        if ($server->status === Server::STATUS_INSTALL_FAILED) {
            throw new \Exception('The server failed to install, so we cannot change the state.');
        }

        $server->update(['status' => $server->isInstalled() ? Server::STATUS_INSTALLING : null]);

        Activity::event('admin:servers:toggle')
            ->subject($server)
            ->property('server', $server)
            ->description('A server installation status was toggled')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Transfer a server to a new node.
     *
     * @throws \Throwable
     */
    public function transfer(TransferServerRequest $request, Server $server): JsonResponse
    {
        $transfer = $this->transferService->handle($server, $request->validated());

        Activity::event('admin:servers:transfer')
            ->subject($server)
            ->property('server', $server)
            ->description('A server transfer was initiated')
            ->log();

        return new JsonResponse([
            'message' => 'Server transfer has been initiated.',
            'transfer' => $transfer,
        ]);
    }

    /**
     * Sends a power action to a batch of servers at once.
     */
    public function bulkPower(BulkPowerActionRequest $request): JsonResponse
    {
        $action = $request->input('action');

        $servers = Server::query()->whereNull('status')->whereIn('id', $request->input('servers'))->with('node')->get();

        $failed = [];
        foreach ($servers as $server) {
            try {
                $this->powerRepository->setServer($server)->send($action);
            } catch (DaemonConnectionException $exception) {
                $failed[] = [
                    'server' => $server->id,
                    'message' => $exception->getMessage(),
                ];
            }
        }

        Activity::event('admin:servers:bulk-power')
            ->property('action', $action)
            ->property('servers', $servers->pluck('id'))
            ->description('A bulk power action was performed on multiple servers')
            ->log();

        return new JsonResponse([
            'action' => $action,
            'total' => $servers->count(),
            'failed' => $failed,
        ]);
    }
}
