<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Everest\Events\Auth\DirectLogin;
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

        $parsed = parse_url($issuer);
        if (($parsed['scheme'] ?? '') !== 'https') {
            throw new DisplayException('OIDC issuer URL must use the https:// scheme.');
        }

        $host = $parsed['host'] ?? '';
        $resolved = gethostbyname($host);
        if (filter_var($resolved, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
            throw new DisplayException('OIDC issuer URL resolves to a disallowed (private or reserved) address.');
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
        $claims = [];

        if (!empty($userinfoEndpoint)) {
            $userinfo = Http::withToken($accessToken)->get($userinfoEndpoint);

            if ($userinfo->successful()) {
                $claims = $userinfo->json() ?? [];
                $email = $claims['email'] ?? null;
            }
        }

        // Fall back to the id_token JWT payload (no signature verification needed here —
        // we already proved we received the code over TLS from the real provider).
        if ((empty($email) || empty($claims)) && !empty($tokens['id_token'])) {
            $parts   = explode('.', $tokens['id_token']);
            $payload = json_decode(base64_decode(strtr($parts[1] ?? '', '-_', '+/')), true) ?? [];
            if (empty($email)) {
                $email = $payload['email'] ?? null;
            }
            if (empty($claims)) {
                $claims = $payload;
            }
        }

        if (empty($email)) {
            throw new DisplayException('OIDC provider did not return an email address. Ensure the "email" scope is granted.');
        }

        if (User::where('email', $email)->exists()) {
            $user = User::where('email', $email)->first();
        } else {
            // Derive a username from the OIDC claims. preferred_username is the
            // standard claim; fall back to the local-part of the email.
            $rawUsername = $claims['preferred_username']
                ?? $claims['nickname']
                ?? explode('@', $email)[0]
                ?? null;

            // Sanitise: lowercase, strip disallowed chars, trim non-alphanumeric
            // edges to satisfy the Username validation rule (/^[a-z0-9]([\w\.-]+)[a-z0-9]$/).
            $username = strtolower((string) $rawUsername);
            $username = preg_replace('/[^a-z0-9_.\-]/', '_', $username);
            $username = trim($username, '_.-');

            // Must be at least 3 chars and unique.
            if (strlen($username) < 3) {
                $username = 'sso_' . $username;
            }
            if (User::where('username', $username)->exists()) {
                $username = $username . '_' . $this->randStr(6);
            }

            // Bypass the public registration toggle — OIDC account creation is
            // always admin-controlled via the module being enabled.
            $user = $this->creation->handle([
                'email'    => $email,
                'username' => $username,
            ]);
        }

        // Regenerate the session and log the user in using the standard web guard.
        // We do NOT use sendLoginResponse() here — that returns a JsonResponse for
        // the XHR login flow. For the OIDC web redirect flow we need a proper
        // server-side session so the Set-Cookie header is included in the redirect.
        $request->session()->regenerate();
        $this->clearLoginAttempts($request);
        $this->auth->guard()->login($user, true);
        Event::dispatch(new DirectLogin($user, true));

        return redirect('/');
    }

    /**
     * Create a random string we can use for a temporary username.
     */
    public function randStr(int $length = 10): string
    {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', (int) ceil($length / strlen($x)))), 1, $length);
    }
}
