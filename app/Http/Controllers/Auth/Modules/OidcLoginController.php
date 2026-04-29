<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Everest\Exceptions\DisplayException;
use Everest\Http\Controllers\Auth\AbstractLoginController;

class OidcLoginController extends AbstractLoginController
{
    /**
     * OidcLoginController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Fetch the OIDC provider's discovery document and cache it for the request.
     *
     * @throws DisplayException
     */
    protected function discover(): array
    {
        $issuer = rtrim(config('modules.auth.oidc.issuer_url'), '/');

        if (empty($issuer)) {
            throw new DisplayException('OIDC issuer URL is not configured.');
        }

        $response = Http::get($issuer . '/.well-known/openid-configuration');

        if (!$response->successful()) {
            throw new DisplayException('Failed to fetch OIDC discovery document from: ' . $issuer);
        }

        return $response->json();
    }

    /**
     * Build the authorization URL and redirect the user to the OIDC provider.
     *
     * @throws DisplayException
     * @throws \Everest\Exceptions\DisplayException
     */
    public function requestToken(Request $request): string
    {
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        $discovery = $this->discover();
        $authorizationEndpoint = $discovery['authorization_endpoint'] ?? null;

        if (empty($authorizationEndpoint)) {
            throw new DisplayException('OIDC provider does not expose an authorization_endpoint.');
        }

        $state = Str::random(40);
        $request->session()->put('oidc_state', $state);

        $scopes = array_filter(array_merge(
            ['openid', 'email', 'profile'],
            explode(' ', config('modules.auth.oidc.scopes', ''))
        ));

        $query = http_build_query([
            'client_id'     => config('modules.auth.oidc.client_id'),
            'redirect_uri'  => route('auth.modules.oidc.authenticate'),
            'response_type' => 'code',
            'scope'         => implode(' ', array_unique($scopes)),
            'state'         => encrypt($state),
        ]);

        return $authorizationEndpoint . '?' . $query;
    }

    /**
     * Handle the OIDC callback, exchange the code for tokens, and log the user in.
     *
     * @throws DisplayException
     */
    public function authenticate(Request $request): RedirectResponse
    {
        // Validate the state parameter to prevent CSRF.
        $encryptedState = $request->input('state');
        $expectedState  = $request->session()->pull('oidc_state');

        try {
            $receivedState = decrypt($encryptedState);
        } catch (\Exception) {
            throw new DisplayException('OIDC state parameter could not be decrypted.');
        }

        if (!$expectedState || !hash_equals($expectedState, $receivedState)) {
            throw new DisplayException('OIDC state mismatch — possible CSRF attack.');
        }

        if ($request->has('error')) {
            throw new DisplayException('OIDC provider returned an error: ' . $request->input('error_description', $request->input('error')));
        }

        $discovery = $this->discover();
        $tokenEndpoint    = $discovery['token_endpoint'] ?? null;
        $userinfoEndpoint = $discovery['userinfo_endpoint'] ?? null;

        if (empty($tokenEndpoint)) {
            throw new DisplayException('OIDC provider does not expose a token_endpoint.');
        }

        // Exchange authorization code for tokens.
        $tokenResponse = Http::asForm()->post($tokenEndpoint, [
            'grant_type'    => 'authorization_code',
            'client_id'     => config('modules.auth.oidc.client_id'),
            'client_secret' => config('modules.auth.oidc.client_secret'),
            'redirect_uri'  => route('auth.modules.oidc.authenticate'),
            'code'          => $request->input('code'),
        ]);

        if (!$tokenResponse->successful()) {
            throw new DisplayException('OIDC token exchange failed: ' . $tokenResponse->body());
        }

        $tokens      = $tokenResponse->json();
        $accessToken = $tokens['access_token'] ?? null;

        if (empty($accessToken)) {
            throw new DisplayException('OIDC provider did not return an access_token.');
        }

        // Try to get the user's email. Prefer userinfo endpoint; fall back to parsing the id_token.
        $email = null;

        if (!empty($userinfoEndpoint)) {
            $userinfo = Http::withToken($accessToken)->get($userinfoEndpoint);

            if ($userinfo->successful()) {
                $email = $userinfo->json('email');
            }
        }

        // Fall back to the id_token JWT payload (no signature verification needed here —
        // we already proved we received the code over TLS from the real provider).
        if (empty($email) && !empty($tokens['id_token'])) {
            $parts   = explode('.', $tokens['id_token']);
            $payload = json_decode(base64_decode(strtr($parts[1] ?? '', '-_', '+/')), true);
            $email   = $payload['email'] ?? null;
        }

        if (empty($email)) {
            throw new DisplayException('OIDC provider did not return an email address. Ensure the "email" scope is granted.');
        }

        if (User::where('email', $email)->exists()) {
            $user = User::where('email', $email)->first();

            $this->sendLoginResponse($user, $request);

            return redirect('/');
        }

        $user = $this->createAccount([
            'email'    => $email,
            'username' => 'null_user_' . $this->randStr(16),
        ]);

        $this->sendLoginResponse($user, $request);

        return redirect('/account/setup');
    }

    /**
     * Create a random string we can use for a temporary username.
     */
    public function randStr(int $length = 10): string
    {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', (int) ceil($length / strlen($x)))), 1, $length);
    }
}
