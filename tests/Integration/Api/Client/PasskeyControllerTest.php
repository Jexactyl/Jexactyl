<?php

namespace Everest\Tests\Integration\Api\Client;

use Everest\Models\User;
use Everest\Models\UserPasskey;

/**
 * Covers the passkey management endpoints on the account.
 *
 * The registration and assertion ceremonies themselves are not exercised here: they need a
 * real authenticator to produce a signature, so they are verified by hand against a browser.
 * What is covered is everything around them — ownership, password confirmation, and the
 * guarantee that credential material never leaves the server.
 */
class PasskeyControllerTest extends ClientApiIntegrationTestCase
{
    protected function tearDown(): void
    {
        UserPasskey::query()->forceDelete();

        parent::tearDown();
    }

    /**
     * Test that only the passkeys for the authenticated user are returned.
     */
    public function testPasskeysAreReturned()
    {
        $user = User::factory()->create();
        $user2 = User::factory()->create();

        $passkey = UserPasskey::factory()->for($user)->create();
        UserPasskey::factory()->for($user2)->create();

        $this->actingAs($user);
        $this->getJson('/api/client/account/passkeys')
            ->assertOk()
            ->assertJsonPath('object', 'list')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.object', UserPasskey::RESOURCE_NAME)
            ->assertJsonPath('data.0.attributes.uuid', $passkey->uuid)
            ->assertJsonPath('data.0.attributes.name', $passkey->name);
    }

    /**
     * The stored credential is the material an attacker would need to impersonate the
     * authenticator, so it must never appear in an API response.
     */
    public function testCredentialMaterialIsNeverExposed()
    {
        $user = User::factory()->create();
        $passkey = UserPasskey::factory()->for($user)->create();

        $response = $this->actingAs($user)->getJson('/api/client/account/passkeys')->assertOk();

        $attributes = $response->json('data.0.attributes');

        $this->assertArrayNotHasKey('credential', $attributes);
        $this->assertArrayNotHasKey('credential_id', $attributes);
        $this->assertStringNotContainsString($passkey->credential_id, $response->getContent());
    }

    /**
     * Starting a registration must fail on a bad password, before the browser ever prompts
     * the user for a fingerprint.
     */
    public function testRegistrationOptionsRequireTheCorrectPassword()
    {
        $user = User::factory()->create();

        $this->actingAs($user);
        $this->postJson('/api/client/account/passkeys/options', ['password' => 'nope'])
            ->assertStatus(400)
            ->assertJsonPath('errors.0.detail', 'The password provided was not valid.');

        $this->postJson('/api/client/account/passkeys/options', ['password' => 'password'])
            ->assertOk()
            ->assertJsonPath('rp.id', parse_url(config('app.url'), PHP_URL_HOST))
            ->assertJsonPath('authenticatorSelection.residentKey', 'required')
            ->assertJsonPath('authenticatorSelection.userVerification', 'required')
            ->assertJsonPath('attestation', 'none');
    }

    /**
     * Accounts created through an SSO module have no password to confirm against.
     */
    public function testRegistrationOptionsSkipPasswordConfirmationWhenNoneIsSet()
    {
        $user = User::factory()->create(['password' => '']);

        $this->actingAs($user)
            ->postJson('/api/client/account/passkeys/options')
            ->assertOk()
            ->assertJsonStructure(['challenge', 'rp', 'user', 'pubKeyCredParams']);
    }

    /**
     * Storing a credential without having started a ceremony must not be possible.
     */
    public function testCredentialCannotBeStoredWithoutAnOngoingCeremony()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/client/account/passkeys', ['name' => 'Laptop', 'credential' => ['id' => 'nope']])
            ->assertStatus(400)
            ->assertJsonPath('errors.0.detail', 'No passkey registration is currently in progress.');

        $this->assertEquals(0, $user->passkeys()->count());
    }

    /**
     * Test that a passkey can be deleted, and that passing the UUID of another user's passkey
     * won't delete that passkey.
     */
    public function testPasskeyCanBeDeleted()
    {
        $user = User::factory()->create();
        $user2 = User::factory()->create();

        $passkey = UserPasskey::factory()->for($user)->create();
        $passkey2 = UserPasskey::factory()->for($user2)->create();

        $endpoint = '/api/client/account/passkeys/remove';

        $this->actingAs($user);
        $this->postJson($endpoint, ['password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.0.meta', ['source_field' => 'uuid', 'rule' => 'required']);

        $this->postJson($endpoint, ['uuid' => $passkey->uuid, 'password' => 'password'])->assertNoContent();
        $this->assertDatabaseMissing('user_passkeys', ['id' => $passkey->id]);

        $this->postJson($endpoint, ['uuid' => $passkey2->uuid, 'password' => 'password'])->assertNoContent();
        $this->assertDatabaseHas('user_passkeys', ['id' => $passkey2->id]);
    }

    public function testPasskeyCannotBeDeletedWithAnIncorrectPassword()
    {
        $user = User::factory()->create();
        $passkey = UserPasskey::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/client/account/passkeys/remove', ['uuid' => $passkey->uuid, 'password' => 'nope'])
            ->assertStatus(400)
            ->assertJsonPath('errors.0.detail', 'The password provided was not valid.');

        $this->assertDatabaseHas('user_passkeys', ['id' => $passkey->id]);
    }

    public function testPasskeyCanBeDeletedWithoutAPasswordWhenNoneIsSet()
    {
        $user = User::factory()->create(['password' => '']);
        $passkey = UserPasskey::factory()->for($user)->create();

        $this->actingAs($user)
            ->postJson('/api/client/account/passkeys/remove', ['uuid' => $passkey->uuid])
            ->assertNoContent();

        $this->assertDatabaseMissing('user_passkeys', ['id' => $passkey->id]);
    }
}
