<?php

return [
    /*
     * Enable or disable jGuard
     */
    'enabled' => (bool) env('JGUARD_ENABLED', false),

    /*
     * Sets a delay in minutes for new user signups.
     * This can be used to prevent spam logins as
     * users have to wait in order to use the Panel.
     */
    'delay' => (int) env('JGUARD_DELAY', 0),
    'abuseipdb_api_key' => env('ABUSEIPDB_API_KEY', ''),
    /*
     * Controls how aggressively jGuard blocks signups from an IP address
     * that has recently registered or failed to log in multiple times.
     *
     * One of "low", "medium", or "high".
     */
    'sensitivity' => env('JGUARD_SENSITIVITY', 'medium'),
];
