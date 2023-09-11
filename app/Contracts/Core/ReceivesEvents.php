<?php

namespace Jexactyl\Contracts\Core;

use Jexactyl\Events\Event;

interface ReceivesEvents
{
    /**
     * Handles receiving an event from the application.
     */
    public function handle(Event $notification): void;
}
