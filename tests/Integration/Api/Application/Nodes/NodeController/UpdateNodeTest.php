<?php

namespace Everest\Tests\Integration\Api\Application\Nodes\NodeController;

use Everest\Models\Node;
use Mockery\MockInterface;
use GuzzleHttp\Psr7\Response;
use Everest\Repositories\Wings\DaemonConfigurationRepository;
use Everest\Tests\Integration\Api\Application\ApplicationApiIntegrationTestCase;

class UpdateNodeTest extends ApplicationApiIntegrationTestCase
{
    public function testCanUpdateNodeProperties(): void
    {
        $node = Node::factory()->create();

        $this->mock(DaemonConfigurationRepository::class, function (MockInterface $mock) use ($node) {
            $mock->expects('setNode')->with(\Mockery::on(fn ($value) => $value->is($node)))->andReturnSelf();
            $mock->expects('update')->withAnyArgs()->andReturn(
                new Response()
            );
        });

        $this->patchJson(route('api.application.nodes.update', ['node' => $node]), [
            'name' => 'New Name',
            'description' => 'New Description',
            'fqdn' => 'new.example.com',
            'sftp_alias' => 'sftp.new.example.com',
            'scheme' => 'https',
            'memory' => 100,
            'memory_overallocate' => 10,
            'disk' => 200,
            'disk_overallocate' => 20,
            'listen_port_http' => 1101,
            'listen_port_sftp' => 1102,
            'public_port_http' => 1103,
            'public_port_sftp' => 1104,
        ])
            ->assertOk()
            ->assertJsonPath('object', 'node')
            ->assertJsonPath('attributes.name', 'New Name')
            ->assertJsonPath('attributes.description', 'New Description')
            ->assertJsonPath('attributes.fqdn', 'new.example.com')
            ->assertJsonPath('attributes.sftp_alias', 'sftp.new.example.com')
            ->assertJsonPath('attributes.scheme', 'https')
            ->assertJsonPath('attributes.memory', 100)
            ->assertJsonPath('attributes.memory_overallocate', 10)
            ->assertJsonPath('attributes.disk', 200)
            ->assertJsonPath('attributes.disk_overallocate', 20)
            ->assertJsonPath('attributes.listen_port_http', 1101)
            ->assertJsonPath('attributes.listen_port_sftp', 1102)
            ->assertJsonPath('attributes.public_port_http', 1103)
            ->assertJsonPath('attributes.public_port_sftp', 1104);
    }
}
