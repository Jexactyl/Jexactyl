<?php

namespace Jexactyl\Events\User;

use Jexactyl\Models\User;
use Jexactyl\Events\Event;
use Illuminate\Queue\SerializesModels;

class Creating extends Event
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public User $user)
    {
    }
}
