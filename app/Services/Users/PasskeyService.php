<?php

namespace Everest\Services\Users;

use Everest\Models\User;
use Webauthn\CredentialRecord;
use Everest\Models\UserPasskey;
use Webauthn\PublicKeyCredential;
use Everest\Exceptions\DisplayException;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Webauthn\PublicKeyCredentialRpEntity;
use Webauthn\PublicKeyCredentialParameters;
use Webauthn\PublicKeyCredentialUserEntity;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\AuthenticatorAttestationResponse;
use Webauthn\PublicKeyCredentialRequestOptions;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\Denormalizer\WebauthnSerializerFactory;
use Symfony\Component\Serializer\SerializerInterface;
use Webauthn\AuthenticatorAssertionResponseValidator;
use Webauthn\CeremonyStep\CeremonyStepManagerFactory;
use Webauthn\AuthenticatorAttestationResponseValidator;
use Webauthn\AttestationStatement\NoneAttestationStatementSupport;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;

/**
 * Wraps web-auth/webauthn-lib so that no controller has to deal with the library directly.
 *
 * Everything this service emits or accepts on its public surface is either an Eloquent model
 * or a plain array, so callers only ever move JSON around.
 */
class PasskeyService
{
    private SerializerInterface $serializer;

    private CeremonyStepManagerFactory $ceremonies;

    private PublicKeyCredentialRpEntity $rp;

    private string $origin;

    private string $rpId;

    public function __construct()
    {
        $appUrl = (string) config('app.url');
        $host = parse_url($appUrl, PHP_URL_HOST) ?: 'localhost';

        $this->origin = rtrim($appUrl, '/');
        $this->rpId = config('everest.auth.passkeys.rp_id') ?: $host;
        $this->rp = PublicKeyCredentialRpEntity::create(
            config('everest.auth.passkeys.rp_name') ?: config('app.name'),
            $this->rpId,
        );

        $attestationSupport = AttestationStatementSupportManager::create([
            NoneAttestationStatementSupport::create(),
        ]);

        $this->serializer = (new WebauthnSerializerFactory($attestationSupport))->create();

        $this->ceremonies = new CeremonyStepManagerFactory();
        $this->ceremonies->setAttestationStatementSupportManager($attestationSupport);
        $this->ceremonies->setAllowedOrigins([$this->origin]);
    }

    /**
     * Builds the options for registering a new passkey against the given account.
     *
     * `residentKey: required` is what makes the credential discoverable, which in turn is what
     * lets the login page offer a one-click sign-in with no username typed. Leaving the
     * authenticator attachment unset means both platform authenticators (Windows Hello, Touch
     * ID) and roaming security keys are accepted.
     */
    public function creationOptions(User $user): PublicKeyCredentialCreationOptions
    {
        $exclude = $user->passkeys->map(fn (UserPasskey $passkey) => $this
            ->toCredentialRecord($passkey)
            ->getPublicKeyCredentialDescriptor())
            ->all();

        return PublicKeyCredentialCreationOptions::create(
            $this->rp,
            PublicKeyCredentialUserEntity::create($user->email, $user->uuid, $user->username),
            random_bytes(32),
            [
                PublicKeyCredentialParameters::create('public-key', -7),   // ES256
                PublicKeyCredentialParameters::create('public-key', -257), // RS256
            ],
            AuthenticatorSelectionCriteria::create(
                null,
                AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_REQUIRED,
                AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_REQUIRED,
            ),
            PublicKeyCredentialCreationOptions::ATTESTATION_CONVEYANCE_PREFERENCE_NONE,
            $exclude,
            (int) config('everest.auth.passkeys.timeout'),
        );
    }

    /**
     * Builds the options for a login ceremony.
     *
     * `allowCredentials` is deliberately empty: the browser resolves the account from the
     * discoverable credential it holds, so we never have to ask who is signing in.
     */
    public function requestOptions(): PublicKeyCredentialRequestOptions
    {
        return PublicKeyCredentialRequestOptions::create(
            random_bytes(32),
            $this->rpId,
            [],
            PublicKeyCredentialRequestOptions::USER_VERIFICATION_REQUIREMENT_REQUIRED,
            (int) config('everest.auth.passkeys.timeout'),
        );
    }

    /**
     * Verifies an attestation returned by the browser and persists the resulting credential.
     *
     * @throws DisplayException
     */
    public function verifyRegistration(
        User $user,
        string $name,
        array $credential,
        PublicKeyCredentialCreationOptions $options,
    ): UserPasskey {
        $response = $this->parse($credential)->response;

        if (!$response instanceof AuthenticatorAttestationResponse) {
            throw new DisplayException('The credential provided was not a registration response.');
        }

        try {
            $record = AuthenticatorAttestationResponseValidator::create($this->ceremonies->creationCeremony())
                ->check($response, $options, $this->rpId);
        } catch (\Throwable $exception) {
            throw new DisplayException('The passkey could not be verified: ' . $exception->getMessage());
        }

        $credentialId = Base64UrlSafe::encodeUnpadded($record->publicKeyCredentialId);

        if (UserPasskey::query()->where('credential_id', $credentialId)->exists()) {
            throw new DisplayException('That passkey is already registered to an account.');
        }

        return $user->passkeys()->create([
            'name' => $name,
            'credential_id' => $credentialId,
            'credential' => $this->serializer->serialize($record, 'json'),
        ]);
    }

    /**
     * Verifies an assertion returned by the browser and returns the passkey it belongs to.
     *
     * The user handle is left null so the library falls back to matching the handle the
     * authenticator returned against the one we stored — the check that actually establishes
     * identity in a usernameless flow.
     *
     * @throws DisplayException
     */
    public function verifyAssertion(array $credential, PublicKeyCredentialRequestOptions $options): UserPasskey
    {
        $publicKeyCredential = $this->parse($credential);
        $response = $publicKeyCredential->response;

        if (!$response instanceof AuthenticatorAssertionResponse) {
            throw new DisplayException('The credential provided was not an authentication response.');
        }

        $passkey = UserPasskey::query()
            ->where('credential_id', Base64UrlSafe::encodeUnpadded($publicKeyCredential->rawId))
            ->first();

        if (is_null($passkey)) {
            throw new DisplayException('That passkey is not registered to any account.');
        }

        try {
            $record = AuthenticatorAssertionResponseValidator::create($this->ceremonies->requestCeremony())
                ->check($this->toCredentialRecord($passkey), $response, $options, $this->rpId, null);
        } catch (\Throwable $exception) {
            throw new DisplayException('The passkey could not be verified: ' . $exception->getMessage());
        }

        // Persist the updated signature counter so a cloned authenticator is caught on the
        // next use, and record when the passkey was last exercised.
        $passkey->forceFill([
            'credential' => $this->serializer->serialize($record, 'json'),
            'last_used_at' => now(),
        ])->save();

        return $passkey;
    }

    /**
     * Serializes ceremony options for storage in the session.
     */
    public function encodeOptions(PublicKeyCredentialCreationOptions|PublicKeyCredentialRequestOptions $options): string
    {
        return $this->serializer->serialize($options, 'json');
    }

    /**
     * Renders ceremony options in the shape the browser expects.
     *
     * Null members are pruned: the library emits an explicit `authenticatorAttachment: null`
     * when no attachment preference is set, and a null is never meaningful in these options.
     */
    public function browserOptions(PublicKeyCredentialCreationOptions|PublicKeyCredentialRequestOptions $options): array
    {
        return $this->pruneNulls(json_decode($this->encodeOptions($options), true));
    }

    private function pruneNulls(array $data): array
    {
        return array_filter(
            array_map(fn ($value) => is_array($value) ? $this->pruneNulls($value) : $value, $data),
            fn ($value) => !is_null($value),
        );
    }

    /**
     * @template T of PublicKeyCredentialCreationOptions|PublicKeyCredentialRequestOptions
     *
     * @param class-string<T> $type
     *
     * @return T
     */
    public function decodeOptions(string $options, string $type)
    {
        return $this->serializer->deserialize($options, $type, 'json');
    }

    /**
     * Turns the JSON the browser handed us into the library's credential object.
     *
     * @throws DisplayException
     */
    private function parse(array $credential): PublicKeyCredential
    {
        try {
            return $this->serializer->deserialize(json_encode($credential), PublicKeyCredential::class, 'json');
        } catch (\Throwable) {
            throw new DisplayException('The credential provided was malformed.');
        }
    }

    private function toCredentialRecord(UserPasskey $passkey): CredentialRecord
    {
        return $this->serializer->deserialize($passkey->credential, CredentialRecord::class, 'json');
    }
}
