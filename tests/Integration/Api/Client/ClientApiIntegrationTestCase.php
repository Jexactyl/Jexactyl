<?php

namespace Jexactyl\Tests\Integration\Api\Client;

use Jexactyl\Models\Node;
use Jexactyl\Models\Task;
use Jexactyl\Models\User;
use Jexactyl\Models\Model;
use Jexactyl\Models\Backup;
use Jexactyl\Models\Server;
use Jexactyl\Models\Database;
use Jexactyl\Models\Location;
use Jexactyl\Models\Schedule;
use Jexactyl\Models\Allocation;
use Jexactyl\Models\DatabaseHost;
use Illuminate\Support\Collection;
use Jexactyl\Tests\Integration\TestResponse;
use Jexactyl\Tests\Integration\IntegrationTestCase;
use Illuminate\Database\Eloquent\Model as EloquentModel;
use Jexactyl\Transformers\Api\Client\BaseClientTransformer;

abstract class ClientApiIntegrationTestCase extends IntegrationTestCase
{
    /**
     * Cleanup after running tests.
     */
    protected function tearDown(): void
    {
        Database::query()->forceDelete();
        DatabaseHost::query()->forceDelete();
        Backup::query()->forceDelete();
        Server::query()->forceDelete();
        Node::query()->forceDelete();
        Location::query()->forceDelete();
        User::query()->forceDelete();

        parent::tearDown();
    }

    /**
     * Override the default createTestResponse from Illuminate so that we can
     * just dump 500-level errors to the screen in the tests without having
     * to keep re-assigning variables.
     *
     * @param \Illuminate\Http\Response $response
     *
     * @return \Illuminate\Testing\TestResponse
     */
    protected function createTestResponse($response)
    {
        return TestResponse::fromBaseResponse($response);
    }

    /**
     * Returns a link to the specific resource using the client API.
     */
    protected function link(mixed $model, string $append = null): string
    {
        switch (get_class($model)) {
            case Server::class:
                $link = "/api/client/servers/$model->uuid";
                break;
            case Schedule::class:
                $link = "/api/client/servers/{$model->server->uuid}/schedules/$model->id";
                break;
            case Task::class:
                $link = "/api/client/servers/{$model->schedule->server->uuid}/schedules/{$model->schedule->id}/tasks/$model->id";
                break;
            case Allocation::class:
                $link = "/api/client/servers/{$model->server->uuid}/network/allocations/$model->id";
                break;
            case Backup::class:
                $link = "/api/client/servers/{$model->server->uuid}/backups/$model->uuid";
                break;
            default:
                throw new \InvalidArgumentException(sprintf('Cannot create link for Model of type %s', class_basename($model)));
        }

        return $link . ($append ? '/' . ltrim($append, '/') : '');
    }

    /**
     * Asserts that the data passed through matches the output of the data from the transformer. This
     * will remove the "relationships" key when performing the comparison.
     */
    protected function assertJsonTransformedWith(array $data, Model|EloquentModel $model)
    {
        $reflect = new \ReflectionClass($model);
        $transformer = sprintf('\\Jexactyl\\Transformers\\Api\\Client\\%sTransformer', $reflect->getShortName());

        $transformer = new $transformer();
        $this->assertInstanceOf(BaseClientTransformer::class, $transformer);

        $this->assertSame(
            $transformer->transform($model),
            Collection::make($data)->except(['relationships'])->toArray()
        );
    }
}
