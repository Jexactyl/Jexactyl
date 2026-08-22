<?php

return [
    /*
     * Enable or disable registration
     */
    "email" => ['enabled' => env('REGISTRATION_EMAIL_ENABLED', false)],
    "discord" => ['enabled' => env('REGISTRATION_DISCORD_ENABLED', false)],
    "google" => ['enabled' => env('REGISTRATION_GOOGLE_ENABLED', false)],
    "jguard" => ['enabled' => env('REGISTRATION_JGUARD_ENABLED', false)],
];
