<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Carbon\CarbonImmutable;
use Everest\Facades\Activity;
use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Everest\Exceptions\DisplayException;
use Everest\Http\Controllers\Auth\AbstractLoginController;

class OidcLoginController extends AbstractLoginController
{
    private const SUPPORTED_RSA_ALGS = [
        'RS256' => OPENSSL_ALGO_SHA256,
        'RS384' => OPENSSL_ALGO_SHA384,
        'RS512' => OPENSSL_ALGO_SHA512,
    ];

    /**
     * HMAC algorithms (symmetric: the key is the configured client_secret).
     * Verification is equivalent in security to RS* when the id_token comes
     * directly from the token endpoint over TLS with confidential-client auth.
     */
    private const SUPPORTED_HMAC_ALGS = [
        'HS256' => 'sha256',
        'HS384' => 'sha384',
        'HS512' => 'sha512',
    ];

    /**
     * Allow up to 5 minutes of clock skew when validating id_token timestamps.
     */
    private const CLOCK_SKEW_SECONDS = 300;

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

        try {
            $response = Http::timeout(5)->connectTimeout(3)->get($issuer . '/.well-known/openid-configuration');
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[OIDC] discovery fetch failed: ' . $e->getMessage());
            throw new DisplayException('Could not reach the OIDC provider at ' . $issuer . '. Check that the panel host can resolve and connect to that hostname.');
        }

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
        $nonce = Str::random(40);
        $request->session()->put('oidc_state', $state);
        $request->session()->put('oidc_nonce', $nonce);

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
            'nonce'         => $nonce,
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
        try {
            return $this->doAuthenticate($request);
        } catch (DisplayException $e) {
            // DisplayException::render() redirects back without logging unless
            // there is a previous exception, so OIDC validation failures
            // would otherwise vanish into a silent redirect to /auth/login.
            Log::warning('[OIDC] authenticate() rejected: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * @throws DisplayException
     */
    private function doAuthenticate(Request $request): RedirectResponse
    {
        Log::debug('[OIDC] authenticate() called', [
            'session_id' => $request->session()->getId(),
            'has_state'  => $request->has('state'),
            'has_code'   => $request->has('code'),
            'has_error'  => $request->has('error'),
        ]);

        // Validate the state parameter to prevent CSRF.
        $encryptedState = $request->input('state');
        $expectedState  = $request->session()->pull('oidc_state');
        $expectedNonce  = $request->session()->pull('oidc_nonce');

        try {
            $receivedState = decrypt($encryptedState);
        } catch (\Throwable $e) {
            Log::error('[OIDC] state decrypt failed: ' . $e->getMessage());
            throw new DisplayException('OIDC state parameter could not be decrypted.');
        }

        if (!$expectedState || !hash_equals($expectedState, $receivedState)) {
            Log::warning('[OIDC] state mismatch — possible CSRF');
            throw new DisplayException('OIDC state mismatch — possible CSRF attack.');
        }

        if (empty($expectedNonce)) {
            throw new DisplayException('OIDC nonce missing from session — restart the login flow.');
        }

        if ($request->has('error')) {
            Log::error('[OIDC] provider returned error: ' . $request->input('error_description', $request->input('error')));
            throw new DisplayException('OIDC provider returned an error: ' . $request->input('error_description', $request->input('error')));
        }

        try {
            $discovery = $this->discover();
        } catch (\Throwable $e) {
            Log::error('[OIDC] discovery failed: ' . get_class($e) . ': ' . $e->getMessage());
            throw $e;
        }

        $tokenEndpoint    = $discovery['token_endpoint'] ?? null;
        $userinfoEndpoint = $discovery['userinfo_endpoint'] ?? null;
        $jwksUri          = $discovery['jwks_uri'] ?? null;

        if (empty($tokenEndpoint)) {
            Log::error('[OIDC] provider discovery document missing token_endpoint');
            throw new DisplayException('OIDC provider does not expose a token_endpoint.');
        }

        // jwks_uri is only required for asymmetric (RS*) id_token signing —
        // HMAC-signed (HS*) id_tokens are verified against the client_secret,
        // not against a JWKS. We defer the missing-jwks_uri error to
        // validateIdToken() so HS* providers without a JWKS still work.

        // Exchange authorization code for tokens.
        try {
            $tokenResponse = Http::asForm()->timeout(10)->connectTimeout(3)->post($tokenEndpoint, [
                'grant_type'    => 'authorization_code',
                'client_id'     => config('modules.auth.oidc.client_id'),
                'client_secret' => config('modules.auth.oidc.client_secret'),
                'redirect_uri'  => route('auth.modules.oidc.authenticate'),
                'code'          => $request->input('code'),
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[OIDC] token endpoint unreachable: ' . $e->getMessage());
            throw new DisplayException('Could not reach the OIDC token endpoint.');
        }

        if (!$tokenResponse->successful()) {
            Log::error('[OIDC] token exchange failed', ['status' => $tokenResponse->status(), 'body' => substr($tokenResponse->body(), 0, 500)]);
            throw new DisplayException('OIDC token exchange failed.');
        }

        Log::debug('[OIDC] token exchange OK', ['status' => $tokenResponse->status()]);

        $tokens      = $tokenResponse->json();
        $accessToken = $tokens['access_token'] ?? null;
        $idToken     = $tokens['id_token'] ?? null;

        if (empty($accessToken)) {
            throw new DisplayException('OIDC provider did not return an access_token.');
        }

        if (empty($idToken)) {
            throw new DisplayException('OIDC provider did not return an id_token.');
        }

        Log::debug('[OIDC] validating id_token', [
            'token_keys' => array_keys($tokens),
            'expected_iss' => rtrim((string) config('modules.auth.oidc.issuer_url'), '/'),
            'expected_aud' => (string) config('modules.auth.oidc.client_id'),
        ]);

        // Fully validate the id_token: signature against the provider's JWKS,
        // and the iss / aud / exp / iat / nonce claims. Without this, an attacker
        // who can substitute the token-endpoint response (or a misconfigured
        // multi-tenant provider) could forge claims and gain access.
        $idTokenClaims = $this->validateIdToken($idToken, $jwksUri, $expectedNonce);

        Log::debug('[OIDC] id_token validated', [
            'sub'            => $idTokenClaims['sub'] ?? null,
            'iss'            => $idTokenClaims['iss'] ?? null,
            'has_email'      => isset($idTokenClaims['email']),
            'email_verified' => $idTokenClaims['email_verified'] ?? null,
        ]);

        // Optionally enrich claims with the userinfo endpoint. Email and
        // email_verified MUST come from a validated source; we trust both
        // the verified id_token and userinfo (which is fetched with the
        // access_token over TLS to the same provider).
        $claims = $idTokenClaims;
        if (!empty($userinfoEndpoint)) {
            try {
                $userinfo = Http::withToken($accessToken)->timeout(5)->connectTimeout(3)->get($userinfoEndpoint);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning('[OIDC] userinfo unreachable, continuing with id_token claims: ' . $e->getMessage());
                $userinfo = null;
            }
            if ($userinfo !== null && $userinfo->successful()) {
                $userinfoClaims = $userinfo->json() ?? [];
                // Per OIDC Core 5.3.2 the userinfo `sub` MUST match the id_token `sub`.
                $userinfoSub = $userinfoClaims['sub'] ?? null;
                if (!empty($userinfoSub) && isset($idTokenClaims['sub']) && !hash_equals((string) $idTokenClaims['sub'], (string) $userinfoSub)) {
                    throw new DisplayException('OIDC userinfo subject does not match id_token subject.');
                }
                $claims = array_merge($claims, $userinfoClaims);
            }
        }

        // Require a verified email. If the provider does not assert
        // email_verified === true, the email claim is untrustworthy and MUST
        // NOT be used for account matching (see OpenID Connect Core 1.0 §5.7).
        $email = $claims['email'] ?? null;
        $emailVerified = $claims['email_verified'] ?? null;
        if (empty($email)) {
            throw new DisplayException('OIDC provider did not return an email address. Ensure the "email" scope is granted.');
        }
        $requireVerified = boolval(config('modules.auth.oidc.require_verified_email', true));
        $isVerified = $emailVerified === true || $emailVerified === 'true' || $emailVerified === 1 || $emailVerified === '1';
        if ($requireVerified && !$isVerified) {
            Log::warning('[OIDC] rejecting login with unverified email', ['sub' => $claims['sub'] ?? null]);
            throw new DisplayException('OIDC provider returned an unverified email address. The administrator must configure the provider to verify email addresses before accounts can be matched.');
        }
        if (!$requireVerified && !$isVerified) {
            // Logged so admins can audit which accounts came in without a verified email
            // claim while the safety toggle was off.
            Log::warning('[OIDC] accepting unverified-email login (toggle disabled)', [
                'sub' => $claims['sub'] ?? null,
                'email_verified' => $emailVerified,
            ]);
        }

        // Match the user by the OIDC (iss, sub) pair — the only stable, opaque
        // identifier guaranteed by the spec. Fall back to email lookup for
        // first-time linking of accounts created before sub-based binding, or
        // for accounts created via the local flow that now sign in via OIDC.
        $tokenIss = (string) ($claims['iss'] ?? '');
        $tokenSub = (string) ($claims['sub'] ?? '');

        $user = User::query()
            ->where('oidc_iss', $tokenIss)
            ->where('oidc_sub', $tokenSub)
            ->first();

        if ($user === null) {
            $user = User::where('email', $email)->first();

            if ($user !== null) {
                // Refuse to silently re-bind an account that is already linked to
                // a *different* OIDC identity. This protects against admins
                // switching providers (or two different upstream accounts with
                // the same verified email) silently inheriting the panel account.
                if (!empty($user->oidc_sub) && (
                    $user->oidc_iss !== $tokenIss || $user->oidc_sub !== $tokenSub
                )) {
                    Log::warning('[OIDC] refusing to relink account already bound to a different OIDC identity', [
                        'user_id' => $user->id,
                    ]);
                    throw new DisplayException('This account is already linked to a different OIDC identity. Contact an administrator to reconcile.');
                }

                // JIT-link this previously-unlinked account to the verified
                // (iss, sub) so subsequent logins match directly even if the
                // email later changes upstream.
                $user->forceFill([
                    'oidc_iss' => $tokenIss,
                    'oidc_sub' => $tokenSub,
                ])->save();
            }
        }

        if ($user === null) {
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
            // always admin-controlled via the module being enabled. We create the
            // User model directly to avoid createAccount()'s registration-enabled
            // guard, which would throw DisplayException if self-registration is off.
            $user = $this->creation->handle([
                'email'    => $email,
                'username' => $username,
                'oidc_iss' => $tokenIss,
                'oidc_sub' => $tokenSub,
            ]);
        }

        // If the user opted into TOTP locally, honour it: stash a checkpoint
        // token in the session and hand off to the same 2FA flow the password
        // path uses. The via_oidc marker lets LoginCheckpointController allow
        // completion even when disable_local_login is set.
        if ($user->use_totp) {
            Activity::event('auth:checkpoint')->withRequestMetadata()->subject($user)->log();

            $token = Str::random(64);
            $request->session()->put('auth_confirmation_token', [
                'user_id' => $user->id,
                'token_value' => $token,
                'expires_at' => CarbonImmutable::now()->addMinutes(5),
                'via_oidc' => true,
            ]);

            Log::info('[OIDC] login pending TOTP checkpoint', ['user_id' => $user->id]);

            return redirect('/auth/login/checkpoint?token=' . urlencode($token));
        }

        // Use sendLoginResponse() so it removes 'auth_confirmation_token' from the
        // session before regenerating. Skipping that step causes AuthenticateSession
        // middleware to treat the session as stale on the next request and
        // immediately log the user back out — they'd be redirected straight back to
        // the login page. Discard its JsonResponse and return our own redirect.
        Log::debug('[OIDC] logging in user', ['user_id' => $user->id]);

        try {
            $this->sendLoginResponse($user, $request);
        } catch (\Throwable $e) {
            Log::error('[OIDC] sendLoginResponse threw: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw $e;
        }

        Log::info('[OIDC] login successful', ['user_id' => $user->id]);

        return redirect('/');
    }

    /**
     * Verify an OIDC id_token: signature (RS* against JWKS, HS* against the
     * client_secret), then the iss / aud / exp / iat / nonce claims. Returns
     * the decoded payload.
     *
     * @throws DisplayException
     */
    private function validateIdToken(string $idToken, ?string $jwksUri, string $expectedNonce): array
    {
        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw new DisplayException('OIDC id_token is malformed.');
        }
        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $header = json_decode($this->base64UrlDecode($headerB64), true);
        if (!is_array($header)) {
            throw new DisplayException('OIDC id_token header could not be parsed.');
        }

        $alg = $header['alg'] ?? null;
        if (empty($alg) || strtolower((string) $alg) === 'none') {
            throw new DisplayException('OIDC id_token must be signed.');
        }

        $signedData = $headerB64 . '.' . $payloadB64;
        $signature  = $this->base64UrlDecode($signatureB64);

        if (array_key_exists($alg, self::SUPPORTED_HMAC_ALGS)) {
            $clientSecret = (string) config('modules.auth.oidc.client_secret');
            if ($clientSecret === '') {
                throw new DisplayException('OIDC id_token uses HMAC signing but no client_secret is configured.');
            }
            $expected = hash_hmac(self::SUPPORTED_HMAC_ALGS[$alg], $signedData, $clientSecret, true);
            if (!hash_equals($expected, $signature)) {
                throw new DisplayException('OIDC id_token signature verification failed.');
            }
        } elseif (array_key_exists($alg, self::SUPPORTED_RSA_ALGS)) {
            if (empty($jwksUri)) {
                throw new DisplayException('OIDC provider does not expose a jwks_uri — cannot verify id_token.');
            }
            try {
                $jwksResponse = Http::timeout(5)->connectTimeout(3)->get($jwksUri);
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::error('[OIDC] JWKS endpoint unreachable: ' . $e->getMessage());
                throw new DisplayException('Could not reach the OIDC JWKS endpoint to verify the id_token signature.');
            }
            if (!$jwksResponse->successful()) {
                throw new DisplayException('Failed to fetch OIDC JWKS.');
            }
            $jwks = $jwksResponse->json();
            if (empty($jwks['keys']) || !is_array($jwks['keys'])) {
                throw new DisplayException('OIDC JWKS contained no keys.');
            }

            $kid = $header['kid'] ?? null;
            $jwk = $this->selectJwk($jwks['keys'], $kid);
            if ($jwk === null) {
                throw new DisplayException('OIDC id_token signing key not found in JWKS.');
            }

            $pem = $this->jwkToRsaPem($jwk);
            $key = openssl_pkey_get_public($pem);
            if ($key === false) {
                throw new DisplayException('OIDC id_token public key could not be loaded.');
            }

            $result = openssl_verify($signedData, $signature, $key, self::SUPPORTED_RSA_ALGS[$alg]);
            if ($result !== 1) {
                throw new DisplayException('OIDC id_token signature verification failed.');
            }
        } else {
            throw new DisplayException('Unsupported OIDC id_token signing algorithm: ' . $alg);
        }

        $payload = json_decode($this->base64UrlDecode($payloadB64), true);
        if (!is_array($payload)) {
            throw new DisplayException('OIDC id_token payload could not be parsed.');
        }

        $now = CarbonImmutable::now()->getTimestamp();

        $exp = $payload['exp'] ?? null;
        if (!is_numeric($exp) || ((int) $exp + self::CLOCK_SKEW_SECONDS) < $now) {
            throw new DisplayException('OIDC id_token is expired or missing an exp claim.');
        }

        $iat = $payload['iat'] ?? null;
        if (!is_numeric($iat) || ((int) $iat - self::CLOCK_SKEW_SECONDS) > $now) {
            throw new DisplayException('OIDC id_token has an invalid iat claim.');
        }

        $nbf = $payload['nbf'] ?? null;
        if ($nbf !== null && (!is_numeric($nbf) || ((int) $nbf - self::CLOCK_SKEW_SECONDS) > $now)) {
            throw new DisplayException('OIDC id_token is not yet valid (nbf).');
        }

        $expectedIss = rtrim((string) config('modules.auth.oidc.issuer_url'), '/');
        $tokenIss    = rtrim((string) ($payload['iss'] ?? ''), '/');
        if (empty($tokenIss) || !hash_equals($expectedIss, $tokenIss)) {
            throw new DisplayException('OIDC id_token issuer does not match the configured issuer.');
        }

        $expectedAud = (string) config('modules.auth.oidc.client_id');
        $tokenAud    = $payload['aud'] ?? null;
        $audMatches  = is_array($tokenAud)
            ? in_array($expectedAud, array_map('strval', $tokenAud), true)
            : (string) $tokenAud === $expectedAud;
        if (!$audMatches) {
            throw new DisplayException('OIDC id_token audience does not match the configured client_id.');
        }

        // If azp is present, it MUST equal our client_id (OIDC Core 1.0 §3.1.3.7 step 5).
        if (isset($payload['azp']) && (string) $payload['azp'] !== $expectedAud) {
            throw new DisplayException('OIDC id_token azp claim does not match the configured client_id.');
        }

        $tokenNonce = $payload['nonce'] ?? null;
        if (empty($tokenNonce) || !hash_equals($expectedNonce, (string) $tokenNonce)) {
            throw new DisplayException('OIDC id_token nonce mismatch — possible replay.');
        }

        if (empty($payload['sub'])) {
            throw new DisplayException('OIDC id_token is missing the sub claim.');
        }

        return $payload;
    }

    /**
     * Pick the JWK to verify with. Prefers a key whose kid matches the JWT header;
     * otherwise falls back to the single key in the set when no kid is supplied.
     */
    private function selectJwk(array $keys, ?string $kid): ?array
    {
        if ($kid !== null) {
            foreach ($keys as $key) {
                if (!is_array($key)) {
                    continue;
                }
                if (($key['kty'] ?? '') !== 'RSA') {
                    continue;
                }
                if (($key['use'] ?? 'sig') !== 'sig') {
                    continue;
                }
                if (($key['kid'] ?? null) === $kid) {
                    return $key;
                }
            }

            return null;
        }

        $candidates = array_values(array_filter($keys, function ($key) {
            return is_array($key) && ($key['kty'] ?? '') === 'RSA' && ($key['use'] ?? 'sig') === 'sig';
        }));

        return count($candidates) === 1 ? $candidates[0] : null;
    }

    /**
     * Convert a JWK RSA public key into a PEM-encoded SubjectPublicKeyInfo so
     * that openssl_verify() can use it.
     */
    private function jwkToRsaPem(array $jwk): string
    {
        if (($jwk['kty'] ?? '') !== 'RSA' || empty($jwk['n']) || empty($jwk['e'])) {
            throw new DisplayException('Only RSA OIDC signing keys are supported.');
        }

        $n = $this->base64UrlDecode($jwk['n']);
        $e = $this->base64UrlDecode($jwk['e']);
        if ($n === '' || $e === '') {
            throw new DisplayException('OIDC JWK has empty modulus or exponent.');
        }

        $rsaPublicKey = $this->asn1Sequence(
            $this->asn1Integer($n) . $this->asn1Integer($e)
        );

        // SubjectPublicKeyInfo: AlgorithmIdentifier(rsaEncryption) || BIT STRING(RSAPublicKey).
        $algorithm = $this->asn1Sequence(
            "\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01" // OID 1.2.840.113549.1.1.1
            . "\x05\x00"                                    // NULL parameters
        );
        $bitString = "\x03" . $this->asn1Length(strlen($rsaPublicKey) + 1) . "\x00" . $rsaPublicKey;
        $spki      = $this->asn1Sequence($algorithm . $bitString);

        return "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split(base64_encode($spki), 64, "\n")
            . "-----END PUBLIC KEY-----\n";
    }

    private function asn1Sequence(string $contents): string
    {
        return "\x30" . $this->asn1Length(strlen($contents)) . $contents;
    }

    private function asn1Integer(string $contents): string
    {
        if ((ord($contents[0]) & 0x80) !== 0) {
            $contents = "\x00" . $contents;
        }

        return "\x02" . $this->asn1Length(strlen($contents)) . $contents;
    }

    private function asn1Length(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }
        $temp = ltrim(pack('N', $length), "\x00");

        return chr(strlen($temp) | 0x80) . $temp;
    }

    private function base64UrlDecode(string $data): string
    {
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }

        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }

    /**
     * Create a random string we can use for a temporary username.
     */
    public function randStr(int $length = 10): string
    {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', (int) ceil($length / strlen($x)))), 1, $length);
    }
}
