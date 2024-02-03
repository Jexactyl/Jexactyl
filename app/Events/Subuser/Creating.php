<?php

namespace Everest\Events\Subuser;

use Everest\Events\Event;
use Everest\Models\Subuser;
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
