<?php

namespace Everest\Tests\Integration\Services\Backups;

use Everest\Enum\JwtScope;
use Everest\Models\Backup;
use Carbon\CarbonImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Everest\Services\Backups\DownloadLinkService;
use Everest\Tests\Integration\IntegrationTestCase;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

class DownloadLinkServiceTest extends IntegrationTestCase
{
    /**
     * Test that a valid wings URL is generated and returned to the caller when not
     * making use of an S3 driver for backups.
     */
    public function testItGeneratesLocalUrlWithJwt(): void
    {
        $server = $this->createServerModel();
        $backup = Backup::factory()->for($server)->create([
            'disk' => Backup::ADAPTER_WINGS,
        ]);

        $url = $this->app->make(DownloadLinkService::class)->handle($backup, $server->user);

        $this->assertStringStartsWith($prefix = $server->node->getConnectionAddress() . '/download/backup?token=', $url);

        $config = Configuration::forSymmetricSigner(new Sha256(), $key = InMemory::plainText($server->node->getDecryptedKey()));

        /** @var \Lcobucci\JWT\Token\Plain $token */
        $token = $config->parser()->parse(substr($url, strlen($prefix)));

        $this->assertTrue(
            $config->validator()->validate($token, new SignedWith(new Sha256(), $key)),
            'Failed to validate that the JWT data returned was signed using the Node\'s secret key.'
        );

        $timestamp = CarbonImmutable::createFromTimestamp(CarbonImmutable::now()->getTimestamp())->timezone('UTC');

        // Check that the claims are generated correctly.
        $this->assertTrue($token->hasBeenIssuedBy(config('app.url')));
        $this->assertTrue($token->isPermittedFor($server->node->getConnectionAddress()));
        $this->assertEquals($timestamp, $token->claims()->get('iat'));
        $this->assertEquals($timestamp->subMinutes(5), $token->claims()->get('nbf'));
        $this->assertEquals($timestamp->addMinutes(15), $token->claims()->get('exp'));
        $this->assertSame($backup->uuid, $token->claims()->get('backup_uuid'));
        $this->assertSame($server->uuid, $token->claims()->get('server_uuid'));
        $this->assertEquals(JwtScope::BackupDownload->value, $token->claims()->get('scope'));
    }
}
