<?php

namespace Everest\Http\Controllers\Auth;

use Carbon\Carbon;
use Everest\Models\User;
use Illuminate\Support\Str;
use Everest\Models\JGuardAttempt;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Everest\Facades\Activity;
use Illuminate\Auth\AuthManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Container\Container;
use Everest\Events\Auth\DirectLogin;
use Illuminate\Support\Facades\Event;
use Everest\Exceptions\DisplayException;
use Everest\Services\Auth\JGuardService;
use Illuminate\Contracts\Auth\Authenticatable;
use Everest\Services\Users\UserCreationService;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

abstract class AbstractLoginController extends ApplicationApiController
{
    use AuthenticatesUsers;

    protected AuthManager $auth;
    protected UserCreationService $creation;
    protected JGuardService $jguard;

    /**
     * Lockout time for failed login requests.
     */
    protected int $lockoutTime;

    /**
     * After how many attempts should logins be throttled and locked.
     */
    protected int $maxLoginAttempts;

    /**
     * Where to redirect users after login / registration.
     */
    protected string $redirectTo = '/';

    /**
     * LoginController constructor.
     */
    public function __construct()
    {
        $this->lockoutTime = config('auth.lockout.time');
        $this->maxLoginAttempts = (int) config('modules.auth.security.attempts');
        $this->auth = Container::getInstance()->make(AuthManager::class);
        $this->creation = Container::getInstance()->make(UserCreationService::class);
        $this->jguard = Container::getInstance()->make(JGuardService::class);
    }

    /**
     * Get the failed login response instance.
     *
     * @return never
     *
     * @throws DisplayException
     */
    protected function sendFailedLoginResponse(Request $request, ?Authenticatable $user = null, ?string $message = null)
    {
        $this->incrementLoginAttempts($request);
        $this->fireFailedLoginEvent($user, [
            $this->getField($request->input('user')) => $request->input('user'),
        ]);

        if (config('modules.auth.jguard.enabled')) {
            $this->jguard->recordAttempt($request->ip(), JGuardAttempt::TYPE_FAILED_LOGIN);
        }

        if ($request->route()->named('auth.login-checkpoint')) {
            throw new DisplayException($message ?? trans('auth.two_factor.checkpoint_failed'));
        }

        throw new DisplayException(trans('auth.failed'));
    }

    /**
     * Send the response after the user was authenticated.
     *
     * @throws DisplayException
     */
    protected function sendLoginResponse(User $user, Request $request): JsonResponse
    {
        $this->assertNotDelayed($user);

        $request->session()->remove('auth_confirmation_token');
        $request->session()->regenerate();

        $this->clearLoginAttempts($request);

        $this->auth->guard()->login($user, true);

        Event::dispatch(new DirectLogin($user, true));

        return new JsonResponse([
            'data' => [
                'complete' => true,
                'intended' => $this->redirectPath(),
                'user' => $user->toReactObject(),
            ],
        ]);
    }

    /**
     * Complete a login that was driven by a full-page redirect flow (i.e. an OAuth/SSO
     * module such as Discord or Google), rather than an in-app API call.
     *
     * Unlike {@see self::sendLoginResponse()}, which is only ever invoked once a caller has
     * already established (via password + optional TOTP checkpoint) that two-factor
     * authentication has been satisfied, OAuth callbacks authenticate a user purely based on
     * a third-party identity provider vouching for their email address. That is not
     * equivalent to satisfying this Panel's own two-factor requirement, so if the account has
     * TOTP enabled we must route the browser through the same `/auth/login/checkpoint` flow
     * used for password logins instead of logging them in immediately.
     */
    protected function completeOAuthLogin(User $user, Request $request, string $intended): RedirectResponse
    {
        if ($user->use_totp) {
            $request->session()->put('auth_confirmation_token', [
                'user_id' => $user->id,
                'token_value' => $token = Str::random(64),
                'expires_at' => CarbonImmutable::now()->addMinutes(5),
            ]);

            Activity::event('auth:checkpoint')->withRequestMetadata()->subject($user)->log();

            return redirect('/auth/login/checkpoint?token=' . $token);
        }

        $this->sendLoginResponse($user, $request);

        return redirect($intended);
    }

    /**
     * Create an account on the Panel if the details do not exist.
     *
     * @throws DisplayException
     */
    public function createAccount(array $data, Request $request): User
    {
        $delay = (int) config('modules.auth.jguard.delay');
        $guard = config('modules.auth.jguard.enabled') ?? false;
        $enabled = config('modules.auth.registration.enabled') ?? false;

        if (!$enabled) {
            throw new DisplayException('User signup is disabled at this time.');
        }

        if (User::where('username', $data['username'])->exists()) {
            throw new DisplayException('This username is already in use by another user.');
        }

        if ($guard && $this->jguard->isSuspicious($request->ip())) {
            throw new DisplayException(
                'Too many recent signups or failed login attempts have been detected from your network. Please try again later.'
            );
        }

        $user = $this->creation->handle($data);

        if ($guard) {
            $this->jguard->recordAttempt($request->ip(), JGuardAttempt::TYPE_REGISTRATION);
        }

        if ($guard || $delay > 0) {
            $this->jguard->delay($user->id, $delay);
        }

        return $user;
    }

    /**
     * Ensure the given user is not currently subject to a jGuard access delay.
     *
     * @throws DisplayException
     */
    protected function assertNotDelayed(User $user): void
    {
        $delayedUntil = $this->jguard->delayedUntil($user->id);

        if (!$delayedUntil) {
            return;
        }

        $minutes = max(1, (int) ceil(Carbon::now()->diffInSeconds($delayedUntil, true) / 60));

        throw new DisplayException(
            "Your account is new and cannot access the Panel yet. Please try again in {$minutes} minute(s)."
        );
    }

    /**
     * Determine if the user is logging in using an email or username.
     */
    protected function getField(?string $input = null): string
    {
        return ($input && str_contains($input, '@')) ? 'email' : 'username';
    }

    /**
     * Fire a failed login event.
     */
    protected function fireFailedLoginEvent(?Authenticatable $user = null, array $credentials = [])
    {
        Event::dispatch(new Failed('auth', $user, $credentials));
    }
}
