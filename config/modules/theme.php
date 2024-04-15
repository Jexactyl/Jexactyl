<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Theme Configuration
    |--------------------------------------------------------------------------
    |
    | These settings allow you to set custom hex values for the Panel's theme.
    | This can be configured in the admin pages, and can also be edited here
    | for ease of use.
    |
    */
    'colors' => [
        'primary' => env('THEME_COLORS_PRIMARY', '#4ade80'),
        'secondary' => env('THEME_COLORS_SECONDARY', '#404040'),

        'background' => env('THEME_COLORS_BACKGROUND', '#000000'),
        'headers' => env('THEME_COLORS_HEADERS', '#171717'),
        'sidebar' => env('THEME_COLORS_SIDEBAR', '#18181b'),
    ]
];
