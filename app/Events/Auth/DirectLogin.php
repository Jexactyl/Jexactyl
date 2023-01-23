<?php

namespace Jexactyl\Events\Auth;

use Jexactyl\Models\User;
use Jexactyl\Events\Event;

class DirectLogin extends Event
{
    public function __construct(public User $user, public bool $remember)
    {
    }
}
