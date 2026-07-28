<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\RedirectResponse;
use Everest\Exceptions\DisplayException;
use Everest\Http\Controllers\Auth\AbstractLoginController;

class DiscordLoginController extends AbstractLoginController
{
    private const STATE_SESSION_KEY = 'discord_oauth2_state';

    /**
     * DiscordLoginController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get the user's Discord token in order to access the account.
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

        // Generate an unguessable, single-use state value and bind it to this session so
        // that the callback can verify the response actually belongs to a flow this
        // browser initiated (CSRF protection for the OAuth handshake).
        $state = Str::random(40);
        $request->session()->put(self::STATE_SESSION_KEY, $state);

        return 'https://discord.com/api/oauth2/authorize?'
            . 'client_id=' . config('modules.auth.discord.client_id')
            . '&redirect_uri=' . route('auth.modules.discord.authenticate')
            . '&response_type=code&scope=identify%20email'
            . '&state=' . $state;
    }

    /**
     * Authenticate with the Discord OAuth2 service.
     *
     * @throws \Everest\Exceptions\DisplayException
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $this->assertEnabled();

        $expectedState = $request->session()->pull(self::STATE_SESSION_KEY);
        $providedState = $request->query('state');

        if (!is_string($expectedState) || !is_string($providedState) || !hash_equals($expectedState, $providedState)) {
            throw new DisplayException('This Discord login request is invalid or has expired, please try again.');
        }

        $response = Http::asForm()->post('https://discord.com/api/oauth2/token', [
            'client_id' => config('modules.auth.discord.client_id'),
            'client_secret' => config('modules.auth.discord.client_secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => route('auth.modules.discord.authenticate'),
        ])->body();

        $response = json_decode($response);

        $account = Http::withHeaders([
            'Authorization' => 'Bearer ' . $response->access_token,
        ])->asForm()->get('https://discord.com/api/users/@me')->body();

        $account = json_decode($account);

        // Discord does not require a user to verify ownership of the email address
        // stored on their account. Trusting an unverified email here would let anyone
        // log in as (or register as) any panel user whose email they merely guess or
        // enter into their own Discord profile, without proving they own it.
        if (empty($account->email) || empty($account->verified)) {
            throw new DisplayException('Your Discord account does not have a verified email address. Please verify your email with Discord and try again.');
        }

        if (User::where('email', $account->email)->exists()) {
            $user = User::where('email', $account->email)->first();

            return $this->completeOAuthLogin($user, $request, '/');
        }
        $user = $this->createAccount(['email' => $account->email, 'username' => 'null_user_' . $this->randStr(16)], $request);

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
        if (!config('modules.auth.discord.enabled')) {
            throw new DisplayException('Discord login is not enabled on this Panel.');
        }
    }
}
