<?php

return [
    /*
     * Enable or disable support tickets
     */
    'enabled' => env('TICKETS_ENABLED', false),

    /*
     * The maximum number of tickets a user can create
     */
    'max_count' => env('TICKETS_MAX_COUNT', 3),
];
