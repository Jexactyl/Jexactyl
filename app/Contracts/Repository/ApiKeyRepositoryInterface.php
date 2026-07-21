<?php

namespace Everest\Contracts\Repository;

use Everest\Models\User;
use Illuminate\Support\Collection;

interface ApiKeyRepositoryInterface extends RepositoryInterface
{
    /**
     * Get all the account API keys that exist for a specific user.
     */
    public function getAccountKeys(User $user): Collection;

    /**
     * Delete an account API key from the panel for a specific user.
     */
    public function deleteAccountKey(User $user, string $identifier): int;
}
