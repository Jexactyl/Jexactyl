<?php

namespace Everest\Tests\Integration\Api\Client\Server;

use Everest\Models\Node;
use Illuminate\Http\Response;
use Everest\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class ServerControllerTest extends ClientApiIntegrationTestCase
{
    /**
     * Test that the node's FQDN is used for the server's SFTP details when no
     * SFTP alias has been configured on the node.
     */
    public function testSftpDetailsUseFqdnWhenNoAliasIsSet(): void
    {
        /** @var Node $node */
        $node = Node::factory()->create(['sftp_alias' => null]);
        $server = $this->createServerModel(['node_id' => $node->id]);

        $this->actingAs($server->user)
            ->getJson("/api/client/servers/$server->uuid")
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath('attributes.sftp_details.ip', $node->fqdn)
            ->assertJsonPath('attributes.sftp_details.port', $node->public_port_sftp);
    }

    /**
     * Test that the node's SFTP alias is used for the server's SFTP details, in
     * place of the FQDN, when one has been configured on the node.
     */
    public function testSftpDetailsUseAliasWhenSet(): void
    {
        /** @var Node $node */
        $node = Node::factory()->create(['sftp_alias' => 'sftp.example.com']);
        $server = $this->createServerModel(['node_id' => $node->id]);

        $this->actingAs($server->user)
            ->getJson("/api/client/servers/$server->uuid")
            ->assertStatus(Response::HTTP_OK)
            ->assertJsonPath('attributes.sftp_details.ip', 'sftp.example.com')
            ->assertJsonPath('attributes.sftp_details.port', $node->public_port_sftp);

        $this->assertNotSame($node->fqdn, 'sftp.example.com');
    }
}
