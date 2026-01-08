<?php

namespace Everest\Services\Servers;

use Everest\Models\Node;
use Everest\Models\Server;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Everest\Models\Allocation;
use Everest\Models\ServerTransfer;
use Everest\Exceptions\DisplayException;
use Everest\Services\Nodes\NodeJWTService;
use Illuminate\Database\ConnectionInterface;
use Everest\Repositories\Wings\DaemonTransferRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ServerTransferService
{
    /**
     * ServerTransferService constructor.
     */
    public function __construct(
        private ConnectionInterface $connection,
        private NodeJWTService $jwtService,
        private DaemonTransferRepository $daemonTransferRepository
    ) {
    }

    /**
     * Initiate a server transfer to a new node.
     *
     * @throws \Throwable
     */
    public function handle(Server $server, array $data): ServerTransfer
    {
        // Validate the server can be transferred.
        $server->validateTransferState();

        $node_id = Arr::get($data, 'node_id');
        $allocation_id = Arr::get($data, 'allocation_id');
        $additional_allocations = Arr::get($data, 'additional_allocations', []);

        // Check that the new node exists.
        try {
            /** @var \Everest\Models\Node $node */
            $node = Node::query()->findOrFail($node_id);
        } catch (ModelNotFoundException) {
            throw new DisplayException('The requested node does not exist.');
        }

        // Prevent transferring to the same node.
        if ($server->node_id === $node->id) {
            throw new DisplayException('The server is already on this node.');
        }

        // Check that the requested allocation belongs to the target node and is available.
        try {
            $allocation = Allocation::query()
                ->where('id', $allocation_id)
                ->where('node_id', $node->id)
                ->whereNull('server_id')
                ->firstOrFail();
        } catch (ModelNotFoundException) {
            throw new DisplayException('The requested allocation is not available on the target node.');
        }

        // Check that additional allocations exist and are available.
        if (!empty($additional_allocations)) {
            $availableAllocations = Allocation::query()
                ->where('node_id', $node->id)
                ->whereNull('server_id')
                ->whereIn('id', $additional_allocations)
                ->count();

            if ($availableAllocations !== count($additional_allocations)) {
                throw new DisplayException('One or more of the additional allocations are not available on the target node.');
            }
        }

        /** @var \Everest\Models\ServerTransfer $transfer */
        $transfer = $this->connection->transaction(function () use ($server, $node, $allocation, $additional_allocations) {
            // Reserve the new allocations.
            $allocationIds = array_merge([$allocation->id], $additional_allocations);
            Allocation::query()->whereIn('id', $allocationIds)->update(['server_id' => $server->id]);

            // Create the server transfer entry.
            $transfer = ServerTransfer::query()->create([
                'server_id' => $server->id,
                'old_node' => $server->node_id,
                'new_node' => $node->id,
                'old_allocation' => $server->allocation_id,
                'new_allocation' => $allocation->id,
                'old_additional_allocations' => $server->allocations->where('id', '!=', $server->allocation_id)->pluck('id')->all(),
                'new_additional_allocations' => $additional_allocations,
            ]);

            return $transfer;
        });

        // Generate a token for the transfer.
        $token = $this->jwtService
            ->setExpiresAt(CarbonImmutable::now()->addMinutes(15))
            ->setSubject($server->uuid)
            ->setClaims(['server_uuid' => $server->uuid])
            ->handle($node, $server->uuid . $transfer->id);

        // Notify the source node to begin the transfer.
        $this->daemonTransferRepository->setServer($server)->notify($node, $token);

        return $transfer->refresh();
    }
}
