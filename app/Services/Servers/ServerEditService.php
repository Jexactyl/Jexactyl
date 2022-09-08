<?php

namespace Pterodactyl\Services\Servers;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Exceptions\DisplayException;
use Symfony\Component\HttpFoundation\Response;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Api\Client\Servers\EditServerRequest;

class ServerEditService
{
    private SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Updates the requested instance with new limits.
     * @throws DisplayException
     */
    public function handle(EditServerRequest $request, Server $server): JsonResponse
    {
        $user = $request->user();
        $amount = $request->input('amount');
        $resource = $request->input('resource');

        $verify = $this->verify($request, $server);
        if (!$verify) throw new DisplayException('Failed to verify.');

        $server->update([$this->toServerDB($request) => $this->toServer($request, $server) + $amount]);

        $user->update(['store_' . (string) $request->input('resource') => $this->toUser($request, $user) - $amount]);

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }

    /**
     * Ensure that the server is not going past the limits
     * for minimum resources per-container.
     *
     * @throws DisplayException
     */
    protected function verify(EditServerRequest $request, Server $server): bool
    {
        $user = $request->user();
        $amount = $request->input('amount');

        //foreach ($resource as $r) {
          $limit = $this->settings->get('jexactyl::store:limit:' . $request->input('resource'));
          // Check if the amount requested goes over defined limits.
          if (($amount + $this->toServer($request, $server)) > $limit) return false;
          // Verify baseline limits. We don't want servers with -4% CPU.
          if ($this->toServer($request, $server) <= $this->toMin($request) && $amount < 0) return false;
          // Verify that the user has the resource in their account.
          if ($this->toUser($request, $user) < $amount) return false;
        //}

        // Return true if all checked.
        return true;
    }

    /**
     * Gets the minimum value for a specific resource.
     *
     * @throws DisplayException
     */
     protected function toMin(EditServerRequest $request): int
     {
         return match($request->input('resource')) {
             'cpu' => 50,
             'allocations' => 1,
             'disk', 'memory' => 1024,
             'backups', 'databases' => 0,
             default => throw new DisplayException('Unable to parse resource type a')
         };
     }

    /**
     * Get the requested resource type and transform it
     * so it can be used in a database statement.
     *
     * @throws DisplayException
     */
     protected function toUser(EditServerRequest $request, User $user): int
     {
         return match ($request->input('resource')) {
             'cpu' => $user->store_cpu,
             'disk' => $user->store_disk,
             'memory' => $user->store_memory,
             'backups' => $user->store_backups,
             'allocations' => $user->store_allocations,
             'databases' => $user->store_databases,
             default => throw new DisplayException('Unable to parse resource type b')
         };
     }

    /**
     * Get the requested resource type and transform it
     * so it can be used in a database statement.
     *
     * @throws DisplayException
     */
    protected function toServer(EditServerRequest $request, Server $server): ?int
    {
        return match ($request->input('resource')) {
            'cpu' => $server->cpu,
            'disk' => $server->disk,
            'memory' => $server->memory,
            'backups' => $server->backup_limit,
            'databases' => $server->database_limit,
            'allocations' => $server->allocation_limit,
            default => throw new DisplayException('fuck')
        };
    }

    protected function toServerDB(EditServerRequest $request): string
    {
        return match ($request->input('resource')) {
            'backups' => 'backup_limit',
            'databases' => 'database_limit',
            'allocations' => 'allocation_limit',
            default => $request->input('resource')
        };
    }
}
