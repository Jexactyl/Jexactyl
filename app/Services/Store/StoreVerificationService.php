<?php

namespace Pterodactyl\Services\Store;

use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Requests\Api\Client\Store\CreateServerRequest;

class StoreVerificationService
{
    /**
     * This service ensures that users cannot create servers, gift
     * resources or edit a servers resource limits if they do not
     * have sufficient resources in their account.
     */
    public function handle(CreateServerRequest $request)
    {
        $user = $request->user();

        if (
            $user->store_slots < 1 ||
            $user->store_ports < 1 ||
            $user->store_cpu < $request->input('cpu') ||
            $user->store_disk < $request->input('disk') ||
            $user->store_memory < $request->input('memory') ||
            $user->store_backups < $request->input('backups') ||
            $user->store_databases < $request->input('databases')
        ) {
            throw new DisplayException('You do not have sufficient resources to deploy this server.');
        }
    }
}
