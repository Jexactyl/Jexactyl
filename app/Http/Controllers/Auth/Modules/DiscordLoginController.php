<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\RedirectResponse;
use Everest\Services\Users\UserCreationService;
use Everest\Http\Controllers\Auth\AbstractLoginController;
use Everest\Contracts\Repository\SettingsRepositoryInterface;

class DiscordLoginController extends AbstractLoginController
{
    /**
     * DiscordLoginController constructor.
     */
    public function __construct(
        private UserCreationService $creationService,
        private SettingsRepositoryInterface $settings,
    ) {
        parent::__construct();
    }

    /**
     * Get the user's Discord token in order to access the account.
     *
     * @throws \Everest\Exceptions\DisplayException
     * @throws \Illuminate\Validation\ValidationException
     */
    public function requestToken(Request $request): JsonResponse
    {
        if ($this->hasTooManyLoginAttempts($request)) {
            $this->fireLockoutEvent($request);
            $this->sendLockoutResponse($request);
        }

        return new JsonResponse(
            'https://discord.com/api/oauth2/authorize?'
            . 'client_id=' . $this->settings->get('settings::modules:auth:discord:client_id')
            . '&redirect_uri=' . route('auth.modules.discord.authenticate')
            . '&response_type=code&scope=identify%20email',
            200,
            [],
            null,
            false
        );
    }

    /**
     * Authenticate with the Discord OAuth2 service.
     */
    public function authenticate(Request $request): RedirectResponse
    {
        $response = Http::asForm()->post('https://discord.com/api/oauth2/token', [
            'client_id' => $this->settings->get('settings::modules:auth:discord:client_id'),
            'client_secret' => $this->settings->get('settings::modules:auth:discord:client_secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => route('auth.modules.discord.authenticate'),
        ])->body();

        $response = json_decode($response);

        $account = Http::withHeaders([
            'Authorization' => 'Bearer ' . $response->access_token,
        ])->asForm()->get('https://discord.com/api/users/@me')->body();

        $account = json_decode($account);

        if (User::where('email', $account->email)->exists()) {
            $user = User::where('email', $account->email)->first();

            $this->sendLoginResponse($user, $request);

            return redirect('/account/setup');
        } else {
            $user = $this->createAccount(['email' => $account->email, 'username' => 'null_user_' . $this->randStr(16)]);

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
