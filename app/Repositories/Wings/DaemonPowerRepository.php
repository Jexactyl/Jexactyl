<?php

namespace Everest\Repositories\Wings;

use Everest\Models\Server;
use Webmozart\Assert\Assert;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\TransferException;
use Everest\Exceptions\Http\Connection\DaemonConnectionException;

/**
 * @method \Everest\Repositories\Wings\DaemonPowerRepository setNode(\Everest\Models\Node $node)
 * @method \Everest\Repositories\Wings\DaemonPowerRepository setServer(\Everest\Models\Server $server)
 */
class DaemonPowerRepository extends DaemonRepository
{
    /**
     * Sends a power action to the server instance.
     *
     * @throws DaemonConnectionException
     */
    public function send(string $action): ResponseInterface
    {
        Assert::isInstanceOf($this->server, Server::class);

        try {
            return $this->getHttpClient()->post(
                sprintf('/api/servers/%s/power', $this->server->uuid),
                ['json' => ['action' => $action]]
            );
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }
    }
}
