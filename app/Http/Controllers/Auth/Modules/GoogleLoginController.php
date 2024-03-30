<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Everest\Services\Users\UserCreationService;
use Everest\Http\Controllers\Auth\AbstractLoginController;
use Everest\Contracts\Repository\SettingsRepositoryInterface;

class GoogleLoginController extends AbstractLoginController
{
    /**
     * GoogleLoginController constructor.
     */
    public function __construct(
        private UserCreationService $creationService,
        private SettingsRepositoryInterface $settings,
    ) {
        parent::__construct();

        $this->config = [
            'redirect' => route('auth.modules.google.authenticate'),
            'client_id' => $this->settings->get('settings::modules:auth:google:client_id'),
            'client_secret' => $this->settings->get('settings::modules:auth:google:client_secret'),
        ];
    }

    /**
     * Get the user's Google details in order to access the account.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Illuminate\Validation\ValidationException
     */
    public function requestToken(Request $request): string
    {
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        return Socialite::buildProvider(\Laravel\Socialite\Two\GoogleProvider::class, $this->config)
            ->redirect()
            ->getTargetUrl();
    }

    /**
     * Authenticate with the Google OAuth2 service.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $response = Socialite::buildProvider(\Laravel\Socialite\Two\GoogleProvider::class, $this->config)->user();

        if (User::where('email', $response->email)->exists()) {
            $user = User::where('email', $response->email)->first();

            $this->sendLoginResponse($user, $request);

            return redirect('/');
        } else {
            $user = $this->createAccount(['email' => $response->email, 'username' => 'null_user_' . $this->randStr(16)]);

            $this->sendLoginResponse($user, $request);

            return redirect('/account/setup');
        }

        return redirect()->route('auth.login');
    }

    /**
     * Create an account on the Panel if the details do not exist.
     */
    public function createAccount(array $data): User
    {
        return $this->creationService->handle($data);
    }

    /**
     * Create a random string we can use for a temporary username.
     */
    public function randStr(int $length = 10): string
    {
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length / strlen($x)))), 1, $length);
    }
}
