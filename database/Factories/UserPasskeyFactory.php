<?php

namespace Database\Factories;

use Everest\Models\User;
use Illuminate\Support\Str;
use Webauthn\CredentialRecord;
use Symfony\Component\Uid\Uuid;
use Webauthn\TrustPath\EmptyTrustPath;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Illuminate\Database\Eloquent\Factories\Factory;
use Webauthn\Denormalizer\WebauthnSerializerFactory;
use Webauthn\AttestationStatement\NoneAttestationStatementSupport;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;

class UserPasskeyFactory extends Factory
{
    /**
     * The credential material here is structurally valid but cryptographically meaningless.
     * Nothing in the test suite verifies a signature against it — the real ceremonies are
     * exercised by hand against a browser, since they require an actual authenticator.
     */
    public function definition(): array
    {
        $credentialId = random_bytes(32);

        return [
            'uuid' => Str::uuid()->toString(),
            'name' => $this->faker->word() . ' Passkey',
            'credential_id' => Base64UrlSafe::encodeUnpadded($credentialId),
            'credential' => $this->serialize($credentialId, Str::uuid()->toString()),
            'last_used_at' => null,
        ];
    }

    /**
     * Binds the stored credential's user handle to the given user, as it would be after a
     * real registration ceremony.
     */
    public function forUser(User $user): self
    {
        return $this->state(fn (array $attributes) => [
            'credential' => $this->serialize(
                Base64UrlSafe::decodeNoPadding($attributes['credential_id']),
                $user->uuid,
            ),
        ]);
    }

    private function serialize(string $credentialId, string $userHandle): string
    {
        $record = CredentialRecord::create(
            $credentialId,
            'public-key',
            ['internal'],
            'none',
            EmptyTrustPath::create(),
            Uuid::fromString('00000000-0000-0000-0000-000000000000'),
            random_bytes(64),
            $userHandle,
            0,
        );

        $serializer = (new WebauthnSerializerFactory(
            AttestationStatementSupportManager::create([NoneAttestationStatementSupport::create()])
        ))->create();

        return $serializer->serialize($record, 'json');
    }
}
