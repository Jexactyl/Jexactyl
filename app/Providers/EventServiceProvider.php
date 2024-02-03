<?php

namespace Everest\Providers;

use Everest\Models\User;
use Everest\Models\Server;
use Everest\Models\Subuser;
use Everest\Models\EggVariable;
use Everest\Observers\UserObserver;
use Everest\Observers\ServerObserver;
use Everest\Observers\SubuserObserver;
use Everest\Observers\EggVariableObserver;
use Everest\Listeners\Auth\AuthenticationListener;
use Everest\Events\Server\Installed as ServerInstalledEvent;
use Everest\Notifications\ServerInstalled as ServerInstalledNotification;
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
