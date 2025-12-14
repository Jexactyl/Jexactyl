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
        $user = Auth::user();
        if (!$user) {
            return new JsonResponse(['error' => 'No authenticated user'], 401);
        }
        $user->discord_id = null;
        $user->skipValidation()->save();
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
        
        // Check if this Discord ID is already linked to another account
        $existingUser = User::where('discord_id', $discord->id)->first();
        if ($existingUser && $existingUser->id !== Auth::user()->id) {
            // Discord account is already linked to a different user
            return redirect('/account?error=discord_already_linked');
        }
        
        // Use skipValidation to avoid unique constraint error
        $user = User::find(Auth::user()->id);
        $user->discord_id = $discord->id;
        $user->skipValidation()->save();

        return redirect('/account');
    }
}
