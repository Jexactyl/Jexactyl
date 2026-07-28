<?php

namespace Everest\Tests\Integration\Http\Controllers\Auth;

use Everest\Models\User;
use Illuminate\Support\Facades\Http;
use Everest\Tests\Integration\Http\HttpTestCase;

class JGuardTest extends HttpTestCase
{
    public function setUp(): void
    {
        parent::setUp();

        // Recaptcha is not the concern of these tests, and jGuard's own throttling is
        // what we actually want to exercise.
        config()->set('recaptcha.enabled', false);
        config()->set('modules.auth.registration.enabled', true);
    }

    protected function register(string $username, string $ip = '10.0.0.1'): \Illuminate\Testing\TestResponse
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/auth/register', [
            'email' => $username . '@example.com',
            'username' => $username,
            'password' => 'a-very-secure-password',
            'confirm_password' => 'a-very-secure-password',
        ]);
    }

    /**
     * With jGuard enabled at "high" sensitivity (threshold of 2 attempts within the
     * window) a third registration from the same IP address should be rejected, while
     * the first two are allowed through as normal.
     */
    public function testEmailRegistrationIsBlockedAfterTooManyAttemptsFromSameIp(): void
    {
        config()->set('modules.auth.jguard.enabled', true);
        config()->set('modules.auth.jguard.sensitivity', 'high');

        $this->register('jguard-user-one')->assertNoContent();
        $this->register('jguard-user-two')->assertNoContent();

        $this->register('jguard-user-three')
            ->assertBadRequest()
            ->assertJsonPath('errors.0.detail', 'Too many recent signups or failed login attempts have been detected from your network. Please try again later.');

        $this->assertTrue(User::where('username', 'jguard-user-one')->exists());
        $this->assertTrue(User::where('username', 'jguard-user-two')->exists());
        $this->assertFalse(User::where('username', 'jguard-user-three')->exists());
    }

    /**
     * Attempts from different IP addresses must not be pooled together, otherwise
     * jGuard would incorrectly throttle unrelated users.
     */
    public function testAttemptsFromDifferentIpsAreTrackedSeparately(): void
    {
        config()->set('modules.auth.jguard.enabled', true);
        config()->set('modules.auth.jguard.sensitivity', 'high');

        $this->register('jguard-ip-a-1', '10.0.0.5')->assertNoContent();
        $this->register('jguard-ip-a-2', '10.0.0.5')->assertNoContent();
        $this->register('jguard-ip-b-1', '10.0.0.6')->assertNoContent();

        $this->assertTrue(User::where('username', 'jguard-ip-b-1')->exists());
    }

    /**
     * When jGuard is disabled entirely, repeated signups from the same IP must not be
     * blocked - the feature should be fully opt-in.
     */
    public function testRegistrationIsNotThrottledWhenJGuardDisabled(): void
    {
        config()->set('modules.auth.jguard.enabled', false);
        config()->set('modules.auth.jguard.sensitivity', 'high');

        $this->register('jguard-disabled-1')->assertNoContent();
        $this->register('jguard-disabled-2')->assertNoContent();
        $this->register('jguard-disabled-3')->assertNoContent();

        $this->assertTrue(User::where('username', 'jguard-disabled-3')->exists());
    }

    /**
     * A user created while a signup delay is configured should not be able to log in
     * to the Panel until that delay has elapsed.
     */
    public function testNewUserCannotLoginUntilSignupDelayExpires(): void
    {
        config()->set('modules.auth.jguard.enabled', false);
        config()->set('modules.auth.jguard.delay', 5);

        $this->register('jguard-delayed-user')->assertNoContent();

        $this->postJson('/auth/login', [
            'user' => 'jguard-delayed-user',
            'password' => 'a-very-secure-password',
        ])
            ->assertBadRequest()
            ->assertJsonPath('errors.0.detail', 'Your account is new and cannot access the Panel yet. Please try again in 5 minute(s).');

        $this->assertGuest();

        $this->travel(6)->minutes();

        $this->postJson('/auth/login', [
            'user' => 'jguard-delayed-user',
            'password' => 'a-very-secure-password',
        ])
            ->assertOk()
            ->assertJsonPath('data.complete', true);

        $this->assertAuthenticated();
    }

    /**
     * jGuard's alt-account detection must apply to OAuth-driven signups (e.g. Discord)
     * exactly the same way it applies to native email/password registrations, since
     * both funnel through the shared AbstractLoginController::createAccount() method.
     */
    public function testDiscordRegistrationIsBlockedAfterTooManyAttemptsFromSameIp(): void
    {
        config()->set('modules.auth.jguard.enabled', true);
        config()->set('modules.auth.jguard.sensitivity', 'high');
        config()->set('modules.auth.discord.enabled', true);
        config()->set('modules.auth.discord.client_id', 'client-id');
        config()->set('modules.auth.discord.client_secret', 'client-secret');

        // Two prior signups from the same IP trip the "high" sensitivity threshold. The
        // Discord callback below must be evaluated against that same source IP.
        $ip = '10.0.0.9';
        $this->register('jguard-discord-warmup-1', $ip)->assertNoContent();
        $this->register('jguard-discord-warmup-2', $ip)->assertNoContent();

        Http::fake([
            'discord.com/api/oauth2/token' => Http::response(json_encode(['access_token' => 'token']), 200),
            'discord.com/api/users/@me' => Http::response(json_encode([
                'email' => 'discord-alt@example.com',
                'verified' => true,
            ]), 200),
        ]);

        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withSession(['discord_oauth2_state' => 'expected-state'])
            ->get(route('auth.modules.discord.authenticate', ['code' => 'auth-code', 'state' => 'expected-state']))
            ->assertBadRequest()
            ->assertJsonPath('errors.0.detail', 'Too many recent signups or failed login attempts have been detected from your network. Please try again later.');

        $this->assertFalse(User::where('email', 'discord-alt@example.com')->exists());
    }
}
