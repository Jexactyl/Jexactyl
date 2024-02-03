<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Database;
use League\Fractal\Resource\Item;
use Everest\Models\Permission;
use League\Fractal\Resource\NullResource;
use Everest\Transformers\Api\Transformer;
use Illuminate\Contracts\Encryption\Encrypter;
use Everest\Contracts\Extensions\HashidsInterface;

class DatabaseTransformer extends Transformer
{
    protected array $availableIncludes = ['password'];

    private Encrypter $encrypter;
    private HashidsInterface $hashids;

    /**
     * Handle dependency injection.
     */
    public function handle(Encrypter $encrypter, HashidsInterface $hashids)
    {
        $this->encrypter = $encrypter;
        $this->hashids = $hashids;
    }

    public function getResourceName(): string
    {
        return Database::RESOURCE_NAME;
    }

    public function transform(Database $model): array
    {
        $model->loadMissing('host');

        return [
            'id' => $this->hashids->encode($model->id),
            'host' => [
                'address' => $model->host->host,
                'port' => $model->host->port,
            ],
            'name' => $model->database,
            'username' => $model->username,
            'connections_from' => $model->remote,
            'max_connections' => $model->max_connections,
        ];
    }

    /**
     * Include the database password in the request.
     */
    public function includePassword(Database $database): Item|NullResource
    {
        if ($this->user()->cannot(Permission::ACTION_DATABASE_VIEW_PASSWORD, $database->server)) {
            return $this->null();
        }

        return $this->item($database, function (Database $model) {
            return [
                'password' => $this->encrypter->decrypt($model->password),
            ];
        }, 'database_password');
    }
}
