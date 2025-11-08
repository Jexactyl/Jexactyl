<?php

namespace Everest\Events\Auth;

use Everest\Models\User;
use Everest\Events\Event;

class ProvidedAuthenticationToken extends Event
{
    public function __construct(public User $user, public bool $recovery = false)
    {
    }
}
