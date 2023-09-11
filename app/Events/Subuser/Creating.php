<?php

namespace Jexactyl\Events\Subuser;

use Jexactyl\Events\Event;
use Jexactyl\Models\Subuser;
use Illuminate\Queue\SerializesModels;

class Creating extends Event
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Subuser $subuser)
    {
    }
}
