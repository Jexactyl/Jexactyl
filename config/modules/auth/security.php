<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Lockout Configuration
    |--------------------------------------------------------------------------
    |
    | These options are Pterodactyl specific and allow you to configure how
    | long a user should be locked out for if they input a username or
    | password incorrectly.
    |
    */
    'attempts' => env('LOGIN_ATTEMPT_LIMIT', 3),
    'force2fa' => env('FORCE_TWO_FACTOR', false),
];
