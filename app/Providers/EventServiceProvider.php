<?php

namespace Everest\Providers;

use Everest\Models\User;
use Everest\Models\Server;
use Everest\Models\Subuser;
use Everest\Models\EggVariable;
use Everest\Observers\UserObserver;
use Everest\Observers\ServerObserver;
use Everest\Observers\SubuserObserver;
use Everest\Listeners\TwoFactorListener;
use Everest\Listeners\RevocationListener;
use Everest\Observers\EggVariableObserver;
use Everest\Listeners\AuthenticationListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $subscribe = [
        AuthenticationListener::class,
        TwoFactorListener::class,
        RevocationListener::class,
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();

        User::observe(UserObserver::class);
        Server::observe(ServerObserver::class);
        Subuser::observe(SubuserObserver::class);
        EggVariable::observe(EggVariableObserver::class);
    }
}
