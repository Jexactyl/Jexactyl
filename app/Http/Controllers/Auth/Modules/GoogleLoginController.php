<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Everest\Exceptions\DisplayException;
use Everest\Http\Controllers\Auth\AbstractLoginController;

class GoogleLoginController extends AbstractLoginController
{
    protected array $config;

    /**
     * GoogleLoginController constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->config = [
            'redirect' => route('auth.modules.google.authenticate'),
            'client_id' => config('modules.auth.google.client_id'),
            'client_secret' => config('modules.auth.google.client_secret'),
        ];
    }

    /**
     * Get the user's Google details in order to access the account.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Illuminate\Validation\ValidationException
     */
    public function requestToken(Request $request): string
    {
        $this->assertEnabled();

        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        return Socialite::buildProvider(GoogleProvider::class, $this->config)
            ->redirect()
            ->getTargetUrl();
    }

    /**
     * Authenticate with the Google OAuth2 service.
     *
     * @throws \Everest\Exceptions\DisplayException
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $this->assertEnabled();

        // Socialite validates the OAuth2 "state" parameter against the session for us here,
        // protecting this callback from login-CSRF.
        $response = Socialite::buildProvider(GoogleProvider::class, $this->config)->user();

        // Google's userinfo payload includes an "email_verified" flag because, like most
        // providers, it is possible in edge cases (e.g. some Workspace domain setups) for
        // an unverified address to be returned. Don't trust the email for account
        // login/creation unless Google has confirmed the user actually owns it.
        $verified = $response->user['email_verified'] ?? $response->user['verified_email'] ?? true;
        if (empty($response->email) || !$verified) {
            throw new DisplayException('Your Google account does not have a verified email address. Please verify your email with Google and try again.');
        }

        if (User::where('email', $response->email)->exists()) {
            $user = User::where('email', $response->email)->first();

            return $this->completeOAuthLogin($user, $request, '/');
        }
        $user = $this->createAccount(['email' => $response->email, 'username' => 'null_user_' . $this->randStr(16)], $request);

        return $this->completeOAuthLogin($user, $request, '/account/setup');
    }

    /**
     * Create a random string we can use for a temporary username.
     */
    public function randStr(int $length = 10): string
    {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length / strlen($x)))), 1, $length);
    }

    /**
     * @throws \Everest\Exceptions\DisplayException
     */
    private function assertEnabled(): void
    {
        if (!config('modules.auth.google.enabled')) {
            throw new DisplayException('Google login is not enabled on this Panel.');
        }
    }
}
