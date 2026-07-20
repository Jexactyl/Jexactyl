<?php

namespace Everest\Repositories\Wings;

use Everest\Models\Node;
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\TransferException;
use Everest\Exceptions\Http\Connection\DaemonConnectionException;

/**
 * @method \Pterodactyl\Repositories\Wings\DaemonConfigurationRepository setNode(\Pterodactyl\Models\Node $node)
 * @method \Pterodactyl\Repositories\Wings\DaemonConfigurationRepository setServer(\Pterodactyl\Models\Server $server)
 */
class DaemonConfigurationRepository extends DaemonRepository
{
    /**
     * Returns system information from the wings instance.
     *
     * @throws DaemonConnectionException
     */
    public function getSystemInformation(?int $version = null): array
    {
        try {
            $response = $this->getHttpClient()->get('/api/system' . (!is_null($version) ? '?v=' . $version : ''));
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }

        return json_decode($response->getBody()->__toString(), true);
    }

    /**
     * Returns utilization from the host system.
     *
     * @throws DaemonConnectionException
     */
    public function getSystemUtilization(): array
    {
        try {
            $response = $this->getHttpClient()->get('/api/system/utilization');
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }

        return json_decode($response->getBody()->__toString(), true);
    }

    /**
     * Updates the configuration information for a daemon. Updates the information for
     * this instance using a passed-in model. This allows us to change plenty of information
     * in the model, and still use the old, pre-update model to actually make the HTTP request.
     *
     * @throws DaemonConnectionException
     */
    public function update(Node $node): ResponseInterface
    {
        try {
            return $this->getHttpClient()->post(
                '/api/update',
                ['json' => $node->getConfiguration()]
            );
        } catch (TransferException $exception) {
            throw new DaemonConnectionException($exception);
        }
    }
}
