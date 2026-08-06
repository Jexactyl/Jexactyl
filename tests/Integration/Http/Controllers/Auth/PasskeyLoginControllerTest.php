<?php

namespace Everest\Tests\Integration\Http\Controllers\Auth;

use Everest\Models\User;
use Illuminate\Auth\Events\Failed;
use Everest\Events\Auth\DirectLogin;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Session;
use Everest\Tests\Integration\Http\HttpTestCase;
use Everest\Http\Controllers\Auth\PasskeyLoginController;

/**
 * Covers the passkey login endpoints.
 *
 * A valid assertion cannot be produced without a real authenticator, so what is covered here
 * is the surface around the ceremony: that the challenge is issued and stashed, that it leaks
 * nothing about which accounts exist, and that a bogus assertion is rejected cleanly rather
 * than logging anybody in.
 */
class PasskeyLoginControllerTest extends HttpTestCase
{
    public function setUp(): void
    {
        parent::setUp();

        Event::fake([Failed::class, DirectLogin::class]);
    }

    public function testOptionsAreIssuedAndStashedInTheSession(): void
    {
        $this->postJson(route('auth.passkey.options'))
            ->assertOk()
            ->assertJsonPath('userVerification', 'required')
            ->assertJsonPath('rpId', parse_url(config('app.url'), PHP_URL_HOST))
            ->assertJsonStructure(['challenge', 'timeout'])
            ->assertSessionHas(PasskeyLoginController::SESSION_KEY);
    }

    /**
     * The credential list must stay empty — that is what lets the browser resolve the account
     * itself, and what keeps the endpoint from confirming whether a given account exists.
     */
    public function testOptionsIdentifyNobody(): void
    {
        User::factory()->create();

        $response = $this->postJson(route('auth.passkey.options'))->assertOk();

        $this->assertSame([], $response->json('allowCredentials'));
        $this->assertArrayNotHasKey('user', $response->json());
    }

    public function testLoginFailsWithoutAnOngoingCeremony(): void
    {
        $this->postJson(route('auth.passkey.login'), ['credential' => ['id' => 'nope']])
            ->assertStatus(400)
            ->assertJsonPath('errors.0.detail', trans('auth.failed'));

        $this->assertGuest();
    }

    public function testLoginFailsWithAMalformedAssertion(): void
    {
        $this->postJson(route('auth.passkey.options'))->assertOk();

        $this->postJson(route('auth.passkey.login'), ['credential' => ['id' => 'not-a-credential']])
            ->assertStatus(400)
            ->assertJsonPath('errors.0.detail', trans('auth.failed'));

        $this->assertGuest();

        // The challenge is single-use: a rejected attempt must not leave it lying around to
        // be replayed against.
        $this->assertNull(Session::get(PasskeyLoginController::SESSION_KEY));
    }
}
