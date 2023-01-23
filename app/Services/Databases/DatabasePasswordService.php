<?php

namespace Jexactyl\Services\Databases;

use Jexactyl\Models\Database;
use Jexactyl\Helpers\Utilities;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Contracts\Encryption\Encrypter;
use Jexactyl\Extensions\DynamicDatabaseConnection;
use Jexactyl\Contracts\Repository\DatabaseRepositoryInterface;

class DatabasePasswordService
{
    /**
     * DatabasePasswordService constructor.
     */
    public function __construct(
        private ConnectionInterface $connection,
        private DynamicDatabaseConnection $dynamic,
        private Encrypter $encrypter,
        private DatabaseRepositoryInterface $repository
    ) {
    }

    /**
     * Updates a password for a given database.
     *
     * @throws \Throwable
     */
    public function handle(Database|int $database): string
    {
        $password = Utilities::randomStringWithSpecialCharacters(24);

        $this->connection->transaction(function () use ($database, $password) {
            $this->dynamic->set('dynamic', $database->database_host_id);

            $this->repository->withoutFreshModel()->update($database->id, [
                'password' => $this->encrypter->encrypt($password),
            ]);

            $this->repository->dropUser($database->username, $database->remote);
            $this->repository->createUser($database->username, $database->remote, $password, $database->max_connections);
            $this->repository->assignUserToDatabase($database->database, $database->username, $database->remote);
            $this->repository->flush();
        });

        return $password;
    }
}
