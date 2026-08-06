<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\User;
use Illuminate\Http\Request;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Exceptions\DisplayException;
use Everest\Services\Users\PasskeyService;
use Webauthn\PublicKeyCredentialCreationOptions;
use Everest\Transformers\Api\Client\UserPasskeyTransformer;
use Illuminate\Contracts\Cache\Repository as CacheRepository;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PasskeyController extends ClientApiController
{
    /**
     * How long a half-finished registration ceremony stays valid, mirroring the window the
     * two-factor checkpoint allows.
     */
    public const CEREMONY_TTL = 300;

    public function __construct(
        private PasskeyService $passkeys,
        private ValidationFactory $validation,
        private CacheRepository $cache,
    ) {
        parent::__construct();
    }

    /**
     * Returns every passkey registered against the logged-in account.
     */
    public function index(Request $request): array
    {
        return $this->transform($request->user()->passkeys, UserPasskeyTransformer::class);
    }

    /**
     * Begins a passkey registration ceremony.
     *
     * The password is confirmed here rather than on store() so that a wrong password fails
     * before the browser prompts the user for a fingerprint.
     */
    public function options(Request $request): JsonResponse
    {
        $this->assertPasswordConfirmed($request);

        $options = $this->passkeys->creationOptions($request->user());

        $this->cache->put($this->cacheKey($request), $this->passkeys->encodeOptions($options), self::CEREMONY_TTL);

        return new JsonResponse($this->passkeys->browserOptions($options));
    }

    /**
     * Stores the credential produced by a registration ceremony.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): array
    {
        $data = $this->validation->make($request->all(), [
            'name' => ['required', 'string', 'max:191'],
            'credential' => ['required', 'array'],
        ])->validate();

        $encoded = $this->cache->pull($this->cacheKey($request));

        if (!is_string($encoded)) {
            throw new BadRequestHttpException('No passkey registration is currently in progress.');
        }

        $options = $this->passkeys->decodeOptions($encoded, PublicKeyCredentialCreationOptions::class);

        try {
            $passkey = $this->passkeys->verifyRegistration(
                $request->user(),
                $data['name'],
                $data['credential'],
                $options,
            );
        } catch (DisplayException $exception) {
            throw new BadRequestHttpException($exception->getMessage());
        }

        Activity::event('user:passkey.create')
            ->subject($passkey)
            ->property('name', $passkey->name)
            ->log();

        return $this->transform($passkey, UserPasskeyTransformer::class);
    }

    /**
     * Removes a passkey from the account.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function delete(Request $request): Response
    {
        $data = $this->validation->make($request->all(), [
            'uuid' => ['required', 'string'],
        ])->validate();

        $this->assertPasswordConfirmed($request);

        $passkey = $request->user()->passkeys()->where('uuid', $data['uuid'])->first();

        if (!is_null($passkey)) {
            $passkey->delete();

            Activity::event('user:passkey.delete')
                ->subject($passkey)
                ->property('name', $passkey->name)
                ->log();
        }

        return $this->returnNoContent();
    }

    /**
     * Where the in-flight registration ceremony is held.
     *
     * These routes live under the API middleware group, which only has a session when the
     * request carries the frontend's cookie — so the ceremony is parked in the cache rather
     * than the session, keyed to the account it belongs to.
     */
    private function cacheKey(Request $request): string
    {
        return 'passkey:registration:' . $request->user()->id;
    }

    /**
     * Accounts created through an SSO module have no usable password, so there is nothing to
     * confirm for them — the active session and the authenticator's own user verification are
     * all the assurance available.
     */
    private function assertPasswordConfirmed(Request $request): void
    {
        /** @var User $user */
        $user = $request->user();

        if (empty($user->password)) {
            return;
        }

        if (!password_verify($request->input('password') ?? '', $user->password)) {
            throw new BadRequestHttpException('The password provided was not valid.');
        }
    }
}
