<?php

namespace Everest\Http\Controllers\Auth\Modules;

use Everest\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Http;
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
            . '&response_type=code&scope=identify%20email'
        , 200, [], null, false);
    }

    /**
     * Authenticate with the Discord OAuth2 service.
     */
    public function authenticate(Request $request): void
    {
        $response = Http::post('https://discord.com/api/oauth2/token', [
            'client_id' => $this->settings->get('settings::modules:auth:discord:client_id'),
            'client_secret' => $this->settings->get('settings::modules:auth:discord:client_secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => route('auth.modules.discord.authenticate'),
        ])->body();

        $response = json_decode($response);

        $account = Http::asForm()->get('https://discord.com/api/users/@me')->withHeaders([
            'Authorization' => 'Bearer ' . $response->access_token,
        ])->body();

        $account = json_decode($account);

        if (User::where('email', $account->email)->exists()) {
            $user = User::where('email', $account->email)->first();

            $this->sendLoginResponse($user, $request);
        } else {
            $user = $this->createAccount(['email' => $account->email, 'username' => $discord->username]);

            $this->sendLoginResponse($user, $request);
        }

        $this->sendFailedLoginResponse($request, $user);

        return;
    }

    /**
     * Create an account on the Panel if the details do not exist.
     */
    public function createAccount(array $data): User
    {
        return $this->creationService->handle($data);
    }
}
