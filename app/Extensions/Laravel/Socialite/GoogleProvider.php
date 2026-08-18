<?php

namespace Everest\Extensions\Laravel\Socialite;

use Illuminate\Support\Str;
use Laravel\Socialite\Two\GoogleProvider as BaseGoogleProvider;

/**
 * Socialite's OAuth2 "state" CSRF token and the panel's reCAPTCHA middleware both
 * read a "state" request parameter, but for entirely different purposes. When this
 * provider's callback is hit, VerifyReCaptcha tries to decrypt Socialite's plain
 * random state as if it were an encrypted reCAPTCHA payload, which throws and
 * produces a 500 error. Prefixing the state lets that middleware recognise and
 * skip OAuth callbacks instead of trying to decrypt them.
 *
 * @see \Everest\Http\Middleware\VerifyReCaptcha
 */
class GoogleProvider extends BaseGoogleProvider
{
    protected function getState()
    {
        return 'google-' . Str::random(40);
    }
}
