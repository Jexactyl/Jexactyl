<?php

namespace Jexactyl\Providers;

use Jexactyl\Models\ApiKey;
use Jexactyl\Models\Server;
use Laravel\Sanctum\Sanctum;
use Jexactyl\Policies\ServerPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     */
    protected $policies = [
        Server::class => ServerPolicy::class,
    ];

    public function boot()
    {
        Sanctum::usePersonalAccessTokenModel(ApiKey::class);

        $this->registerPolicies();
    }

    public function register()
    {
        Sanctum::ignoreMigrations();
    }
}
