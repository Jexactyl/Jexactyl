<?php

namespace Jexactyl\Providers;

use Jexactyl\Models\User;
use Jexactyl\Models\Server;
use Jexactyl\Models\Subuser;
use Jexactyl\Models\EggVariable;
use Jexactyl\Observers\UserObserver;
use Jexactyl\Observers\ServerObserver;
use Jexactyl\Observers\SubuserObserver;
use Jexactyl\Observers\EggVariableObserver;
use Jexactyl\Listeners\Auth\AuthenticationListener;
use Jexactyl\Events\Server\Installed as ServerInstalledEvent;
use Jexactyl\Notifications\ServerInstalled as ServerInstalledNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        ServerInstalledEvent::class => [ServerInstalledNotification::class],
    ];

    protected $subscribe = [
        AuthenticationListener::class,
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
