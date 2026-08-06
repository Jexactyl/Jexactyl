<?php

namespace Everest\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Everest\Facades\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Container\Container;
use Everest\Exceptions\DisplayException;
use Everest\Services\Users\PasskeyService;
use Webauthn\PublicKeyCredentialRequestOptions;

class PasskeyLoginController extends AbstractLoginController
{
    /**
     * The session key holding the options of the login ceremony currently in flight.
     */
    public const SESSION_KEY = 'passkey_authentication_options';

    protected PasskeyService $passkeys;

    public function __construct()
    {
        parent::__construct();

        $this->passkeys = Container::getInstance()->make(PasskeyService::class);
    }

    /**
     * Begins a passkey login ceremony.
     *
     * The options carry no credential list and identify nobody, so this endpoint leaks
     * nothing about which accounts exist — it just hands out a challenge.
     */
    public function options(Request $request): JsonResponse
    {
        $options = $this->passkeys->requestOptions();

        $request->session()->put(self::SESSION_KEY, $this->passkeys->encodeOptions($options));

        return new JsonResponse($this->passkeys->browserOptions($options));
    }

    /**
     * Completes a passkey login ceremony.
     *
     * A passkey backed by user verification is already two factors, so this deliberately
     * bypasses the TOTP checkpoint that a password login would route through.
     *
     * @throws DisplayException
     */
    public function login(Request $request): JsonResponse
    {
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        $encoded = $request->session()->pull(self::SESSION_KEY);

        if (!is_string($encoded)) {
            $this->sendFailedLoginResponse($request);
        }

        $options = $this->passkeys->decodeOptions($encoded, PublicKeyCredentialRequestOptions::class);

        try {
            $passkey = $this->passkeys->verifyAssertion($request->input('credential', []), $options);
        } catch (DisplayException) {
            $this->sendFailedLoginResponse($request);
        }

        $response = $this->sendLoginResponse($passkey->user, $request);

        // Marks this session as having satisfied multi-factor authentication, so the forced
        // 2FA middleware doesn't push a passkey-only account towards TOTP enrolment.
        $request->session()->put('auth_passkey', true);

        Activity::event('auth:passkey')->withRequestMetadata()->subject($passkey->user)->log();

        return $response;
    }
}
