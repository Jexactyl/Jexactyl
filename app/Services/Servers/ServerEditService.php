<?php

namespace Pterodactyl\Services\Servers;

use Illuminate\Http\Response;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Requests\Api\Client\Servers\EditServerRequest;

class ServerEditService
{
    /**
     * Updates the requested instance with new limits.
     */
    public function handle(EditServerRequest $request, Server $server)
    {
        $user = $request->user();
        $amount = $request->input('amount');
        $resource = $request->input('resource');

        $this->verifyResources($request, $server);

        $server->update([
            $resource => $this->getServerResource($request, $server) + $amount,
        ]);

        $user->update([
            // Won't currently work with ports, backups, databases.
            'store_'.$this->convertResource($request) => $this->getUserResource($request) - $amount,
        ]);

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * @throws DisplayException
     */
    protected function convertResource(EditServerRequest $request)
    {
        switch ($request->input('resource')) {
            case 'cpu':
                return 'cpu';
            case 'memory':
                return 'memory';
            case 'disk':
                return 'disk';
            case 'allocation_limit':
                return 'ports';
            case 'backup_limit':
                return 'backups';
            case 'database_limit':
                return 'databases';
            default:
                throw new DisplayException('Unable to parse resource type.');
        }
    }

    /**
     * Get the requested resource type and transform it
     * so it can be used in a database statement.
     *
     * @throws DisplayException
     */
    protected function getUserResource(EditServerRequest $request)
    {
        switch ($request->input('resource')) {
            case 'cpu':
                return $request->user()->store_cpu;
            case 'memory':
                return $request->user()->store_memory;
            case 'disk':
                return $request->user()->store_disk;
            case 'allocation_limit':
                return $request->user()->store_ports;
            case 'backup_limit':
                return $request->user()->store_backups;
            case 'database_limit':
                return $request->user()->store_databases;
            default:
                throw new DisplayException('Unable to parse resource type.');
        }
    }

    /**
     * Get the requested resource type and transform it
     * so it can be used in a database statement.
     *
     * @throws DisplayException
     */
    protected function getServerResource(EditServerRequest $request, Server $server)
    {
        switch ($request->input('resource')) {
            case 'cpu':
                return $server->cpu;
            case 'memory':
                return $server->memory;
            case 'disk':
                return $server->disk;
            case 'allocation_limit':
                return $server->allocation_limit;
            case 'backup_limit':
                return $server->backup_limit;
            case 'database_limit':
                return $server->database_limit;
            default:
                throw new DisplayException('无法解析资源类型。');
        }
    }

    /**
     * Ensure that the server is not going past the limits
     * for minimum resources per-container.
     *
     * @throws DisplayException
     */
    protected function verifyResources(EditServerRequest $request, Server $server)
    {
        $resource = $request->input('resource');
        $amount = $request->input('amount');
        $user = $request->user();

        // Check that the server's limits are acceptable.
        if ($resource == 'cpu' && $server->cpu <= 50 && $amount < 0) throw new DisplayException('分配给服务器的 CPU 不得低于 50%。');
        if ($resource == 'memory' && $server->memory <= 1024 && $amount < 0) throw new DisplayException('分配给服务器的内存不能低于 1GB。');
        if ($resource == 'disk' && $server->disk <= 1024 && $amount < 0) throw new DisplayException('分配给服务器的存储空间不能低于 1GB。');

        if ($resource == 'allocation_limit' && $server->allocation_limit <= 1 && $amount < 0) throw new DisplayException('分配给服务器的网络分配不能少于 1 个。');
        if ($resource == 'backup_limit' && $server->backup_limit <= 0 && $amount < 0) throw new DisplayException('分配给服务器的备份槽位不能少于 0 个。');
        if ($resource == 'database_limit' && $server->database_limit <= 0 && $amount < 0) throw new DisplayException('分配给服务器的数据库槽位不能少于 0 个。');


        // Check whether the user has enough resource in their account.
        if ($resource == 'cpu' && $user->store_cpu < $amount) throw new DisplayException('您没有足够的 CPU 来添加更多到您的服务器。');
        if ($resource == 'memory' && $user->store_memory < $amount) throw new DisplayException('您没有足够的内存来添加更多到您的服务器实例。');
        if ($resource == 'disk' && $user->store_disk < $amount) throw new DisplayException('您没有足够的存储空间来添加更多到您的服务器实例。');

        if ($resource == 'allocation_limit' && $user->store_ports < $amount) throw new DisplayException('您没有足够的端口来添加更多到您的服务器实例。');
        if ($resource == 'backup_limit' && $user->store_backups < $amount) throw new DisplayException('您没有足够的备份来添加更多到您的服务器实例。');
        if ($resource == 'database_limit' && $user->store_databases < $amount) throw new DisplayException('您没有足够的数据库来添加更多到您的服务器实例。');
    }
}
