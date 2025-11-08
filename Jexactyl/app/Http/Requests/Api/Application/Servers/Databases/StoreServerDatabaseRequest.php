<?php

namespace Everest\Http\Requests\Api\Application\Servers\Databases;

use Everest\Models\Server;
use Illuminate\Support\Arr;
use Webmozart\Assert\Assert;
use Everest\Models\AdminRole;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use Everest\Services\Databases\DatabaseManagementService;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreServerDatabaseRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        /** @var \Everest\Models\Server $server */
        $server = $this->route()->parameter('server');

        return [
            'database' => [
                'required',
                'alpha_dash',
                'min:1',
                'max:48',
                Rule::unique('databases')->where(function (Builder $query) use ($server) {
                    $query->where('server_id', $server->id)->where('database', $this->databaseName());
                }),
            ],
            'remote' => 'required|string|regex:/^[0-9%.]{1,15}$/',
            'host' => 'required|integer|exists:database_hosts,id',
        ];
    }

    /**
     * @param string|null $key
     * @param string|array|null $default
     *
     * @return mixed
     */
    public function validated($key = null, $default = null)
    {
        $data = [
            'database' => $this->input('database'),
            'remote' => $this->input('remote'),
            'database_host_id' => $this->input('host'),
        ];

        return is_null($key) ? $data : Arr::get($data, $key, $default);
    }

    public function attributes(): array
    {
        return [
            'host' => 'Database Host Server ID',
            'remote' => 'Remote Connection String',
            'database' => 'Database Name',
        ];
    }

    public function databaseName(): string
    {
        $server = $this->route()->parameter('server');

        Assert::isInstanceOf($server, Server::class);

        return DatabaseManagementService::generateUniqueDatabaseName($this->input('database'), $server->id);
    }

    public function permission(): string
    {
        return AdminRole::SERVERS_UPDATE;
    }
}
