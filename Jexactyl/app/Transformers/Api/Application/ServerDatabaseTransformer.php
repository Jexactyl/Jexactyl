<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\Database;
use League\Fractal\Resource\Item;
use Everest\Services\Acl\Api\AdminAcl;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;
use Illuminate\Contracts\Encryption\Encrypter;

class ServerDatabaseTransformer extends Transformer
{
    protected array $availableIncludes = ['host', 'password'];

    private Encrypter $encrypter;

    /**
     * Perform dependency injection.
     */
    public function handle(Encrypter $encrypter)
    {
        $this->encrypter = $encrypter;
    }

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return Database::RESOURCE_NAME;
    }

    /**
     * Transform a database model in a representation for the application API.
     */
    public function transform(Database $model): array
    {
        return [
            'id' => $model->id,
            'database_host_id' => $model->database_host_id,
            'server_id' => $model->server_id,
            'name' => $model->database,
            'username' => $model->username,
            'remote' => $model->remote,
            'max_connections' => $model->max_connections,
            'created_at' => $model->created_at->toIso8601String(),
            'updated_at' => $model->updated_at->toIso8601String(),
        ];
    }

    /**
     * Return the database host relationship for this server database.
     */
    public function includeHost(Database $model): Item|NullResource
    {
        if (!$this->authorize(AdminAcl::RESOURCE_DATABASE_HOSTS)) {
            return $this->null();
        }

        return $this->item($model->host, new DatabaseHostTransformer());
    }

    /**
     * Include the database password in the request.
     */
    public function includePassword(Database $model): Item
    {
        return $this->item($model, function (Database $model) {
            return [
                'password' => $this->encrypter->decrypt($model->password),
            ];
        }, 'database_password');
    }
}
