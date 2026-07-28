<?php

namespace Everest\Http\Controllers\Api\Remote\Servers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Models\Allocation;
use Everest\Models\ServerTransfer;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\ConnectionInterface;
use Everest\Repositories\Eloquent\ServerRepository;
use Everest\Repositories\Wings\DaemonServerRepository;
use Everest\Exceptions\Http\Connection\DaemonConnectionException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class ServerTransferController extends ApplicationApiController
{
    /**
     * ServerTransferController constructor.
     */
    public function __construct(
        private ConnectionInterface $connection,
        private ServerRepository $repository,
        private DaemonServerRepository $daemonServerRepository,
    ) {
    }

    /**
     * The daemon notifies us about a transfer failure.
     *
     * @throws \Throwable
     */
    public function failure(Request $request, string $uuid): Response
    {
        /** @var \Everest\Models\Node $node */
        $node = $request->attributes->get('node');

        $server = $this->repository->getByUuid($uuid);
        $transfer = $server->transfer;
        if (is_null($transfer)) {
            throw new ConflictHttpException('Server is not being transferred.');
        }

        if ($transfer->new_node !== $node->id) {
            throw new NotFoundHttpException();
        }

        return $this->processFailedTransfer($transfer);
    }

    /**
     * The daemon notifies us about a transfer success.
     *
     * @throws \Throwable
     */
    public function success(Request $request, string $uuid): Response
    {
        /** @var \Everest\Models\Node $node */
        $node = $request->attributes->get('node');

        $server = $this->repository->getByUuid($uuid);
        $transfer = $server->transfer;
        if (is_null($transfer)) {
            throw new ConflictHttpException('Server is not being transferred.');
        }

        if ($transfer->new_node !== $node->id) {
            throw new NotFoundHttpException();
        }

        /** @var \Everest\Models\Server $server */
        $server = $this->connection->transaction(function () use ($server, $transfer) {
            $allocations = array_merge([$transfer->old_allocation], $transfer->old_additional_allocations);

            // Remove the old allocations for the server and re-assign the server to the new
            // primary allocation and node.
            Allocation::query()->whereIn('id', $allocations)->update(['server_id' => null]);

            // Assign the new allocations to the server
            $newAllocations = array_merge([$transfer->new_allocation], $transfer->new_additional_allocations);
            Allocation::query()->whereIn('id', $newAllocations)->update(['server_id' => $server->id]);

            $server->update([
                'allocation_id' => $transfer->new_allocation,
                'node_id' => $transfer->new_node,
            ]);

            $server = $server->fresh();
            $server->transfer->update(['successful' => true]);

            return $server;
        });

        // Delete the server from the old node making sure to point it to the old node so
        // that we do not delete it from the new node the server was transferred to.
        try {
            $this->daemonServerRepository
                ->setServer($server)
                ->setNode($transfer->oldNode)
                ->delete();
        } catch (DaemonConnectionException $exception) {
            Log::warning($exception, ['transfer_id' => $server->transfer->id]);
        }

        return $this->returnNoContent();
    }

    /**
     * Release all the reserved allocations for this transfer and mark it as failed in
     * the database.
     *
     * @throws \Throwable
     */
    protected function processFailedTransfer(ServerTransfer $transfer): Response
    {
        $this->connection->transaction(function () use (&$transfer) {
            $transfer->forceFill(['successful' => false])->saveOrFail();

            $allocations = array_merge([$transfer->new_allocation], $transfer->new_additional_allocations);
            Allocation::query()->whereIn('id', $allocations)->update(['server_id' => null]);
        });

        return $this->returnNoContent();
    }
}
