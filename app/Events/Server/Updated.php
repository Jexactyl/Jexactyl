<?php

namespace Everest\Events\Server;

use Everest\Events\Event;
use Everest\Models\Server;
use Illuminate\Queue\SerializesModels;

class Updated extends Event
{
    use SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Server $server)
    {
    }
}
