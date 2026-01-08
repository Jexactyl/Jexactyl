<?php

namespace Everest\Tests\Integration\Services\Servers;

use Everest\Models\Node;
use Everest\Models\Server;
use Mockery\MockInterface;
use Everest\Models\Allocation;
use Everest\Models\ServerTransfer;
use Everest\Exceptions\DisplayException;
use Everest\Services\Nodes\NodeJWTService;
use Everest\Tests\Integration\IntegrationTestCase;
use Everest\Services\Servers\ServerTransferService;
use Everest\Repositories\Wings\DaemonTransferRepository;
use Everest\Exceptions\Http\Server\ServerStateConflictException;

class ServerTransferServiceTest extends IntegrationTestCase
{
    private MockInterface $daemonTransferRepository;
    private MockInterface $jwtService;

    /**
     * Setup test instance.
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->daemonTransferRepository = \Mockery::mock(DaemonTransferRepository::class);
        $this->app->instance(DaemonTransferRepository::class, $this->daemonTransferRepository);

        $this->jwtService = \Mockery::mock(NodeJWTService::class);
        $this->app->instance(NodeJWTService::class, $this->jwtService);
    }

    public function testServerCanBeTransferredToNewNode()
    {
        /** @var \Everest\Models\Server $server */
        $server = $this->createServerModel();

        /** @var \Everest\Models\Node $targetNode */
        $targetNode = Node::factory()->create();

        /** @var \Everest\Models\Allocation $targetAllocation */
        $targetAllocation = Allocation::factory()->create([
            'node_id' => $targetNode->id,
            'server_id' => null,
        ]);

        $this->jwtService->expects('setExpiresAt->setSubject->setClaims->handle')
            ->once()
            ->andReturn(\Mockery::mock(\Lcobucci\JWT\Token\Plain::class));

        $this->daemonTransferRepository->expects('setServer->notify')
            ->once()
            ->andReturnSelf();

        $transfer = $this->getService()->handle($server, [
            'node_id' => $targetNode->id,
            'allocation_id' => $targetAllocation->id,
        ]);

        $this->assertInstanceOf(ServerTransfer::class, $transfer);
        $this->assertEquals($server->id, $transfer->server_id);
        $this->assertEquals($server->node_id, $transfer->old_node);
        $this->assertEquals($targetNode->id, $transfer->new_node);
        $this->assertEquals($server->allocation_id, $transfer->old_allocation);
        $this->assertEquals($targetAllocation->id, $transfer->new_allocation);

        // Verify the allocation was reserved
        $this->assertEquals($server->id, $targetAllocation->refresh()->server_id);
    }

    public function testExceptionIsThrownIfServerIsNotInstalled()
    {
        $server = $this->createServerModel(['status' => Server::STATUS_INSTALLING]);
        $targetNode = Node::factory()->create();
        $targetAllocation = Allocation::factory()->create([
            'node_id' => $targetNode->id,
            'server_id' => null,
        ]);

        $this->expectException(ServerStateConflictException::class);

        $this->getService()->handle($server, [
            'node_id' => $targetNode->id,
            'allocation_id' => $targetAllocation->id,
        ]);
    }

    public function testExceptionIsThrownIfTransferringToSameNode()
    {
        $server = $this->createServerModel();
        $allocation = Allocation::factory()->create([
            'node_id' => $server->node_id,
            'server_id' => null,
        ]);

        $this->expectException(DisplayException::class);
        $this->expectExceptionMessage('The server is already on this node.');

        $this->getService()->handle($server, [
            'node_id' => $server->node_id,
            'allocation_id' => $allocation->id,
        ]);
    }

    public function testExceptionIsThrownIfAllocationIsNotAvailable()
    {
        $server = $this->createServerModel();
        $targetNode = Node::factory()->create();
        $targetAllocation = Allocation::factory()->create([
            'node_id' => $targetNode->id,
            'server_id' => Server::factory()->create()->id, // Already assigned
        ]);

        $this->expectException(DisplayException::class);
        $this->expectExceptionMessage('The requested allocation is not available on the target node.');

        $this->getService()->handle($server, [
            'node_id' => $targetNode->id,
            'allocation_id' => $targetAllocation->id,
        ]);
    }

    public function testTransferWithAdditionalAllocations()
    {
        $server = $this->createServerModel();
        $targetNode = Node::factory()->create();
        $targetAllocation = Allocation::factory()->create([
            'node_id' => $targetNode->id,
            'server_id' => null,
        ]);
        $additionalAllocation = Allocation::factory()->create([
            'node_id' => $targetNode->id,
            'server_id' => null,
        ]);

        $this->jwtService->expects('setExpiresAt->setSubject->setClaims->handle')
            ->once()
            ->andReturn(\Mockery::mock(\Lcobucci\JWT\Token\Plain::class));

        $this->daemonTransferRepository->expects('setServer->notify')
            ->once()
            ->andReturnSelf();

        $transfer = $this->getService()->handle($server, [
            'node_id' => $targetNode->id,
            'allocation_id' => $targetAllocation->id,
            'additional_allocations' => [$additionalAllocation->id],
        ]);

        $this->assertEquals([$additionalAllocation->id], $transfer->new_additional_allocations);

        // Verify both allocations were reserved
        $this->assertEquals($server->id, $targetAllocation->refresh()->server_id);
        $this->assertEquals($server->id, $additionalAllocation->refresh()->server_id);
    }

    private function getService(): ServerTransferService
    {
        return $this->app->make(ServerTransferService::class);
    }
}
