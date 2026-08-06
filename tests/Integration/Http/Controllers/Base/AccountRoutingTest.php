<?php

namespace Everest\Tests\Integration\Http\Controllers\Base;

use Everest\Models\User;
use Everest\Tests\Integration\Http\HttpTestCase;

/**
 * Two-factor enrolment lives under the security tab, so the pages a user needs in order to
 * satisfy a forced two-factor requirement have to stay reachable while they are still in
 * breach of it — otherwise there is no way out of the redirect.
 */
class AccountRoutingTest extends HttpTestCase
{
    public function setUp(): void
    {
        parent::setUp();

        config()->set('modules.auth.security.force2fa', true);
    }

    public function testSecurityPagesAreReachableWithoutTwoFactor(): void
    {
        $user = User::factory()->create(['use_totp' => false]);

        $this->actingAs($user);

        $this->get('/account')->assertOk();
        $this->get('/account/security')->assertOk();
        $this->get('/account/security/passkeys')->assertOk();
        $this->get('/account/security/ssh')->assertOk();
        $this->get('/account/security/api')->assertOk();
    }

    public function testOtherPagesStillRedirectToTheSecurityTab(): void
    {
        $user = User::factory()->create(['use_totp' => false]);

        $this->actingAs($user)
            ->get('/')
            ->assertRedirect('/account/security');
    }

    public function testPagesAreReachableOnceTwoFactorIsEnabled(): void
    {
        $user = User::factory()->create(['use_totp' => true]);

        $this->actingAs($user)->get('/')->assertOk();
    }
}
