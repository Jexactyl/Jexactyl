<?php

namespace Everest\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Auth\AuthManager;
use Illuminate\Support\Facades\RateLimiter;
use Everest\Services\Users\UserUpdateService;
use Everest\Transformers\Api\Client\AccountTransformer;
use Everest\Http\Requests\Api\Client\Account\SetupUserRequest;
use Everest\Http\Requests\Api\Client\Account\UpdateEmailRequest;
use Everest\Http\Requests\Api\Client\Account\UpdatePasswordRequest;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class AccountController extends ClientApiController
{
    /**
     * The number of seconds that must elapse before the email change throttle resets.
     */
    private const EMAIL_UPDATE_THROTTLE = 60 * 60 * 24;

    /**
     * AccountController constructor.
     */
    public function __construct(private AuthManager $manager, private UserUpdateService $updateService)
    {
        parent::__construct();
    }

    public function index(Request $request): array
    {
        return $this->fractal->item($request->user())
            ->transformWith(AccountTransformer::class)
            ->toArray();
    }

    /**
     * Update the authenticated user's email address.
     */
    public function updateEmail(UpdateEmailRequest $request): Response
    {
        $user = $request->user();
        // Only allow a user to change their email three times in the span
        // of 24 hours. This prevents malicious users from trying to find
        // existing accounts in the system by constantly changing their email.
        if (RateLimiter::tooManyAttempts($key = "user:update-email:{$user->uuid}", 3)) {
            throw new TooManyRequestsHttpException(message: 'Your email address has been changed too many times today. Please try again later.');
        }

        $original = $user->email;
        if (mb_strtolower($original) !== mb_strtolower($request->validated('email'))) {
            RateLimiter::hit($key, self::EMAIL_UPDATE_THROTTLE);

            $this->updateService->handle($user, $request->validated());

            Activity::event('user:account.email-changed')
                ->property(['old' => $original, 'new' => $request->validated('email')])
                ->log();
        }

        return $this->returnNoContent();
    }

    /**
     * Update the authenticated user's password. All existing sessions will be logged
     * out immediately.
     *
     * @throws \Throwable
     */
    public function updatePassword(UpdatePasswordRequest $request): Response
    {
        $user = Activity::event('user:account.password-changed')->transaction(function () use ($request) {
            return $this->updateService->handle($request->user(), $request->validated());
        });

        $guard = $this->manager->guard();
        // If you do not update the user in the session you'll end up working with a
        // cached copy of the user that does not include the updated password. Do this
        // to correctly store the new user details in the guard and allow the logout
        // other devices functionality to work.
        $guard->setUser($user);

        // This method doesn't exist in the stateless Sanctum world.
        if (method_exists($guard, 'logoutOtherDevices')) { // @phpstan-ignore function.alreadyNarrowedType
            $guard->logoutOtherDevices($request->input('password'));
        }

        Activity::event('user:account.password-changed')->log();

        return $this->returnNoContent();
    }

    /**
     * Set up an account when registered with OAuth2.
     */
    public function setup(SetupUserRequest $request): Response
    {
        $user = $this->updateService->handle($request->user(), $request->validated());

        return $this->returnNoContent();
    }
}
