<?php

namespace Everest\Tests\Integration\Api\Client;

use Everest\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AccountControllerTest extends ClientApiIntegrationTestCase
{
    /**
     * Test that the user's account details are returned from the account endpoint.
     */
    public function testAccountDetailsAreReturned()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/api/client/account');

        $response->assertOk()->assertJson([
            'object' => 'user',
            'attributes' => [
                'id' => $user->id,
                'admin' => false,
                'username' => $user->username,
                'email' => $user->email,
                'language' => $user->language,
            ],
        ]);
    }

    /**
     * Test that the user's email address can be updated via the API.
     */
    public function testEmailIsUpdated()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/client/account/email', [
            'email' => $email = Str::random() . '@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(Response::HTTP_NO_CONTENT);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $email]);
    }

    /**
     * Tests that an email is not updated if the password provided in the request is not
     * valid for the account.
     */
    public function testEmailIsNotUpdatedWhenPasswordIsInvalid()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/client/account/email', [
            'email' => 'hodor@example.com',
            'password' => 'invalid',
        ]);

        $response->assertStatus(Response::HTTP_BAD_REQUEST);
        $response->assertJsonPath('errors.0.code', 'InvalidPasswordProvidedException');
        $response->assertJsonPath('errors.0.detail', 'The password provided was invalid for this account.');
    }

    /**
     * Tests that an email is not updated if an invalid email address is passed through
     * in the request.
     */
    public function testEmailIsNotUpdatedWhenNotValid()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/client/account/email', [
            'email' => '',
            'password' => 'password',
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response->assertJsonPath('errors.0.meta.rule', 'required');
        $response->assertJsonPath('errors.0.detail', 'The email field is required.');

        $response = $this->actingAs($user)->putJson('/api/client/account/email', [
            'email' => 'invalid',
            'password' => 'password',
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response->assertJsonPath('errors.0.meta.rule', 'email');
        $response->assertJsonPath('errors.0.detail', 'The email must be a valid email address.');
    }

    /**
     * Test that the password for an account can be successfully updated.
     */
    public function testPasswordIsUpdated()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $initialHash = $user->password;

        $response = $this->actingAs($user)->putJson('/api/client/account/password', [
            'current_password' => 'password',
            'password' => 'New_Password1',
            'password_confirmation' => 'New_Password1',
        ]);

        $user = $user->refresh();

        $this->assertNotEquals($user->password, $initialHash);
        $this->assertTrue(Hash::check('New_Password1', $user->password));
        $this->assertFalse(Hash::check('password', $user->password));

        $response->assertStatus(Response::HTTP_NO_CONTENT);
    }

    /**
     * Test that the password for an account is not updated if the current password is not
     * provided correctly.
     */
    public function testPasswordIsNotUpdatedIfCurrentPasswordIsInvalid()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/client/account/password', [
            'current_password' => 'invalid',
            'password' => 'New_Password1',
            'password_confirmation' => 'New_Password1',
        ]);

        $response->assertStatus(Response::HTTP_BAD_REQUEST);
        $response->assertJsonPath('errors.0.code', 'InvalidPasswordProvidedException');
        $response->assertJsonPath('errors.0.detail', 'The password provided was invalid for this account.');
    }

    /**
     * Test that a validation error is returned to the user if no password is provided or if
     * the password is below the minimum password length.
     */
    public function testErrorIsReturnedForInvalidRequestData()
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/client/account/password', [
            'current_password' => 'password',
        ])
            ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
            ->assertJsonPath('errors.0.meta.rule', 'required');

        $this->actingAs($user)->putJson('/api/client/account/password', [
            'current_password' => 'password',
            'password' => 'pass',
            'password_confirmation' => 'pass',
        ])
            ->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
            ->assertJsonPath('errors.0.meta.rule', 'min');
    }

    /**
     * Test that a validation error is returned if the password passed in the request
     * does not have a confirmation, or the confirmation is not the same as the password.
     */
    public function testErrorIsReturnedIfPasswordIsNotConfirmed()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/client/account/password', [
            'current_password' => 'password',
            'password' => 'New_Password1',
            'password_confirmation' => 'Invalid_New_Password',
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response->assertJsonPath('errors.0.meta.rule', 'confirmed');
        $response->assertJsonPath('errors.0.detail', 'The password confirmation does not match.');
    }

    /**
     * Test that a user's avatar can be set to a manually provided URL, and that
     * the value is reflected back through the account endpoint.
     */
    public function testAvatarIsUpdatedFromUrl()
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/client/account/avatar', [
            'avatar_url' => 'https://example.com/avatar.png',
        ]);

        $response->assertOk();
        $response->assertJsonPath('attributes.avatar_url', 'https://example.com/avatar.png');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'avatar_url' => 'https://example.com/avatar.png']);
    }

    /**
     * Test that a user's avatar can be set by uploading an image, that the file is stored
     * on the public disk, and that the previously stored file is cleaned up when replaced.
     */
    public function testAvatarIsUpdatedFromUploadedFile()
    {
        Storage::fake('public');

        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)->call(
            'POST',
            '/api/client/account/avatar',
            [],
            [],
            ['avatar' => UploadedFile::fake()->image('avatar.png')],
        );

        $response->assertOk();

        $user = $user->refresh();
        $this->assertNotNull($user->getRawOriginal('avatar_url'));
        Storage::disk('public')->assertExists($user->getRawOriginal('avatar_url'));
    }

    /**
     * Test that a user's avatar can be removed, reverting the account back to using the
     * default generated avatar on the frontend.
     */
    public function testAvatarIsRemoved()
    {
        Storage::fake('public');

        /** @var User $user */
        $user = User::factory()->create(['avatar_url' => 'https://example.com/avatar.png']);

        $response = $this->actingAs($user)->deleteJson('/api/client/account/avatar');

        $response->assertOk();
        $response->assertJsonPath('attributes.avatar_url', null);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'avatar_url' => null]);
    }
}
