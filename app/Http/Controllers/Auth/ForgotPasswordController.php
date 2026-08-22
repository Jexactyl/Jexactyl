<?php

namespace Everest\Http\Controllers\Auth;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Everest\Exceptions\DisplayException;
use Everest\Services\Users\UserUpdateService;

class ForgotPasswordController extends AbstractLoginController
{
    /**
     * ForgotPasswordController constructor.
     */
    public function __construct(private UserUpdateService $updateService)
    {
        parent::__construct();
    }

    /**
     * Validate the information provided for resetting a password.
     */
    protected function verify(Request $request): JsonResponse|RedirectResponse
    {
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        $guard = (config('modules.auth.jguard.enabled') ?? false);
        if ($guard && $this->jguard->isSuspicious($request->ip())) {
            throw new DisplayException('Too many recent attempts from your IP. Please try again later.');
        }
        try {
            $user = User::where('email', $request->input('email'))->firstOrFail();
        } catch (DisplayException $ex) {
            throw new DisplayException('The information provided was incorrect.');
        }

        if (!$user->recovery_code || !password_verify($request->input('code'), $user->recovery_code)) {
            throw new DisplayException('The information provided was incorrect.');
        }

        if ($request->input('password') !== $request->input('password_confirm')) {
            throw new DisplayException('The passwords entered do not match.');
        }

        $user = $this->updateService->handle($user, ['password' => $request->input('password')]);

        if (!$user->use_totp) {
            return $this->sendLoginResponse($user, $request);
        }

        return redirect()->route('auth.login');

    }
}
