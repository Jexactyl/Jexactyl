<?php

namespace Everest\Services\Activity;

use Illuminate\Database\Eloquent\Model;

class ActivityLogTargetableService
{
    protected ?Model $actor = null;

    protected ?Model $subject = null;

    protected ?int $apiKeyId = null;

    protected ?bool $isAdmin = false;

    public function setActor(Model $actor): void
    {
        $this->actor = $actor;
    }

    public function setIsAdmin(): void
    {
        $this->isAdmin = true;
    }

    public function setSubject(Model $subject): void
    {
        $this->subject = $subject;
    }

    public function setApiKeyId(?int $apiKeyId): void
    {
        $this->apiKeyId = $apiKeyId;
    }

    public function actor(): ?Model
    {
        return $this->actor;
    }

    public function subject(): ?Model
    {
        return $this->subject;
    }

    public function apiKeyId(): ?int
    {
        return $this->apiKeyId;
    }

    public function isAdmin(): ?bool
    {
        return $this->isAdmin;
    }

    public function reset(): void
    {
        $this->actor = null;
        $this->subject = null;
        $this->apiKeyId = null;
        $this->isAdmin = false;
    }
}
