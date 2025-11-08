<?php

return [
    /*
     * Enable or disable jGuard
     */
    'enabled' => env('JGUARD_ENABLED', false),

    /*
     * Sets a delay in minutes for new user signups.
     * This can be used to prevent spam logins as
     * users have to wait in order to use the Panel.
     */
    'delay' => env('JGUARD_DELAY', 0),
];
