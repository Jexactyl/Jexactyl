<?php

namespace Jexactyl\Http\Controllers\Api\Client;

use Jexactyl\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\RedirectResponse;

class DiscordController extends ClientApiController
{
    /**
     * AccountController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function link(): JsonResponse
    {
        return new JsonResponse([
            'https://discord.com/api/oauth2/authorize?'
            . 'client_id=' . $this->settings->get('jexactyl::discord:id')
            . '&redirect_uri=' . route('api:client.account.discord.callback')
            . '&response_type=code&scope=identify%20email%20guilds%20guilds.join&prompt=none',
        ], 200, [], null, false);
    }

    public function unlink(): JsonResponse
    {
        $user->update(['discord_id' => null]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    public function callback(Request $request): RedirectResponse
    {
        $code = Http::asForm()->post('https://discord.com/api/oauth2/token', [
            'client_id' => $this->settings->get('jexactyl::discord:id'),
            'client_secret' => $this->settings->get('jexactyl::discord:secret'),
            'grant_type' => 'authorization_code',
            'code' => $request->input('code'),
            'redirect_uri' => route('api:client.account.discord.callback'),
        ]);

        if (!$code->ok()) {
            return redirect('/account');
        }

        $req = json_decode($code->body());
        if (preg_match('(email|identify)', $req->scope) !== 1) {
            return redirect('/account');
        }

        $discord = json_decode(Http::withHeaders(['Authorization' => 'Bearer ' . $req->access_token])->asForm()->get('https://discord.com/api/users/@me')->body());
        User::query()->where('id', Auth::user()->id)->update(['discord_id' => $discord->id]);

        return redirect('/account');
    }
}
