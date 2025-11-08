<?php

namespace Everest\Events\Auth;

use Everest\Models\User;
use Everest\Events\Event;

class DirectLogin extends Event
{
    public function __construct(public User $user, public bool $remember)
    {
    }
}
