<?php

namespace Everest\Services\Nodes;

use Everest\Models\Node;
use Everest\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Jexactyl\Enum\JwtScope;
use Lcobucci\JWT\Token\Plain;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Everest\Extensions\Lcobucci\JWT\Encoding\TimestampDates;

class NodeJWTService
{
    private array $claims = [];

    private array $scopes = [];

    private ?User $user = null;

    private ?\DateTimeImmutable $expiresAt;

    private ?string $subject = null;

    /**
     * Set the claims to include in this JWT.
     */
    public function setClaims(array $claims): self
    {
        $this->claims = $claims;

        return $this;
    }

    /**
     * Set the scopes that this JWT is valid for. Wings (1.12.0+) requires a matching
     * "scope" claim on every JWT it receives, so this must be set for the daemon to
     * accept the token (e.g. when authenticating a websocket connection).
     */
    public function setScopes(JwtScope ...$scopes): self
    {
        $this->scopes = $scopes;

        return $this;
    }

    /**
     * Attaches a user to the JWT being created and will automatically inject the
     * "user_uuid" key into the final claims array with the user's UUID.
     */
    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function setExpiresAt(\DateTimeImmutable $date): self
    {
        $this->expiresAt = $date;

        return $this;
    }

    public function setSubject(string $subject): self
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * Generate a new JWT for a given node.
     */
    public function handle(Node $node, ?string $identifiedBy, string $algo = 'md5'): Plain
    {
        $identifier = hash($algo, $identifiedBy);
        $config = Configuration::forSymmetricSigner(new Sha256(), InMemory::plainText($node->getDecryptedKey()));

        $builder = $config->builder(new TimestampDates())
            ->issuedBy(config('app.url'))
            ->permittedFor($node->getConnectionAddress())
            ->identifiedBy($identifier)
            ->withHeader('jti', $identifier)
            ->issuedAt(CarbonImmutable::now())
            ->canOnlyBeUsedAfter(CarbonImmutable::now()->subMinutes(5));

        if ($this->expiresAt) {
            $builder = $builder->expiresAt($this->expiresAt);
        }

        if (!empty($this->subject)) {
            $builder = $builder->relatedTo($this->subject)->withHeader('sub', $this->subject);
        }

        foreach ($this->claims as $key => $value) {
            $builder = $builder->withClaim($key, $value);
        }

        // Wings validates a space-delimited "scope" claim on every JWT it receives.
        // Without it, requests such as websocket authentication are rejected with
        // "There was an error validating the credentials provided for the websocket."
        if (!empty($this->scopes)) {
            $builder = $builder->withClaim('scope', implode(' ', array_map(fn (JwtScope $scope) => $scope->value, $this->scopes)));
        }

        if (!is_null($this->user)) {
            $builder = $builder
                ->withClaim('user_uuid', $this->user->uuid)
                // The "user_id" claim is deprecated and should not be referenced — it remains
                // here solely to ensure older versions of Wings are unaffected when the Panel
                // is updated.
                //
                // This claim will be removed in Panel@1.11 or later.
                ->withClaim('user_id', $this->user->id);
        }

        return $builder
            ->withClaim('unique_id', Str::random())
            ->getToken($config->signer(), $config->signingKey());
    }
}
