<?php

return [
    /*
     * Enable or disable support tickets
     */
    'enabled' => (bool) env('TICKETS_ENABLED', false),

    /*
     * The maximum number of tickets a user can create
     */
    'max_count' => (int) env('TICKETS_MAX_COUNT', 3),
];
