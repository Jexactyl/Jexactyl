<?php

namespace Everest\Tests\Unit\Http\Middleware;

use Mockery as m;
use Everest\Models\User;
use Illuminate\Session\Store;
use Everest\Http\Middleware\RequireTwoFactorAuthentication;

class RequireTwoFactorAuthenticationTest extends MiddlewareTestCase
{
    public function setUp(): void
    {
        parent::setUp();

        config()->set('modules.auth.security.force2fa', true);

        $this->request->shouldReceive('getRequestUri')->andReturn('/');
        $this->setRequestRouteName('index');
    }

    /**
     * A session established with a passkey has already satisfied multi-factor authentication,
     * so it must not be pushed towards TOTP enrolment.
     */
    public function testPasskeySessionSatisfiesTheRequirement()
    {
        $this->generateRequestUserModel(['use_totp' => false]);
        $this->mockSession(passkey: true);

        $this->getMiddleware()->handle($this->request, $this->getClosureAssertions());
    }

    public function testUserWithTotpIsPassedThrough()
    {
        $this->generateRequestUserModel(['use_totp' => true]);
        $this->mockSession(passkey: false);

        $this->getMiddleware()->handle($this->request, $this->getClosureAssertions());
    }

    /**
     * Without either factor the user is sent to the security tab, which is where two-factor
     * enrolment lives.
     */
    public function testUserWithNeitherFactorIsRedirected()
    {
        $this->generateRequestUserModel(['use_totp' => false]);
        $this->mockSession(passkey: false);

        $this->request->shouldReceive('isJson')->andReturn(false);

        $response = $this->getMiddleware()->handle($this->request, $this->getClosureAssertions());

        $this->assertStringEndsWith('/account/security', $response->getTargetUrl());
    }

    public function testRequirementIsSkippedEntirelyWhenNotForced()
    {
        config()->set('modules.auth.security.force2fa', false);

        $this->generateRequestUserModel(['use_totp' => false]);

        $this->getMiddleware()->handle($this->request, $this->getClosureAssertions());
    }

    public function testGuestsArePassedThrough()
    {
        $this->setRequestUserModel(null);

        $this->getMiddleware()->handle($this->request, $this->getClosureAssertions());
    }

    private function mockSession(bool $passkey): void
    {
        $session = m::mock(Store::class);
        $session->shouldReceive('get')->with('auth_passkey', false)->andReturn($passkey);

        $this->request->shouldReceive('session')->andReturn($session);
    }

    private function getMiddleware(): RequireTwoFactorAuthentication
    {
        return new RequireTwoFactorAuthentication();
    }
}
