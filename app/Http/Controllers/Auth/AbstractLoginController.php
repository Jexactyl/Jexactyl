<?php

namespace Everest\Http\Controllers\Auth;

use Carbon\Carbon;
use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\DB;
use Illuminate\Container\Container;
use Everest\Events\Auth\DirectLogin;
use Illuminate\Support\Facades\Event;
use Everest\Exceptions\DisplayException;
use Everest\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\Authenticatable;
use Everest\Services\Users\UserCreationService;
use Illuminate\Foundation\Auth\AuthenticatesUsers;

abstract class AbstractLoginController extends Controller
{
    use AuthenticatesUsers;

    protected AuthManager $auth;

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
    }

    /**
     * Get the failed login response instance.
     *
     * @return never
     *
     * @throws DisplayException
     */
    protected function sendFailedLoginResponse(Request $request, Authenticatable $user = null, string $message = null)
    {
        $this->incrementLoginAttempts($request);
        $this->fireFailedLoginEvent($user, [
            $this->getField($request->input('user')) => $request->input('user'),
        ]);

        if ($request->route()->named('auth.login-checkpoint')) {
            throw new DisplayException($message ?? trans('auth.two_factor.checkpoint_failed'));
        }

        throw new DisplayException(trans('auth.failed'));
    }

    /**
     * Send the response after the user was authenticated.
     */
    protected function sendLoginResponse(User $user, Request $request): JsonResponse
    {
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
     * Create an account on the Panel if the details do not exist.
     */
    public function createAccount(array $data): User
    {
        $delay = (int) config('modules.auth.jguard.delay') ?? 0;
        $guard = config('modules.auth.jguard.enabled') ?? false;
        $enabled = config('modules.auth.registration.enabled') ?? false;

        if (!$enabled) {
            throw new DisplayException('User signup is disabled at this time.');
        }

        if (User::where('username', $data['username'])->exists()) {
            throw new DisplayException('This username is already in use by another user.');
        }

        $user = $this->creation->handle($data);

        if ($guard || $delay > 0) {
            DB::table('jguard_delay')->insert([
                'user_id' => $user->id,
                'expires_at' => Carbon::now()->add($delay, 'minute'),
            ]);
        }

        return $user;
    }

    /**
     * Determine if the user is logging in using an email or username.
     */
    protected function getField(string $input = null): string
    {
        return ($input && str_contains($input, '@')) ? 'email' : 'username';
    }

    /**
     * Fire a failed login event.
     */
    protected function fireFailedLoginEvent(Authenticatable $user = null, array $credentials = [])
    {
        Event::dispatch(new Failed('auth', $user, $credentials));
    }
}
