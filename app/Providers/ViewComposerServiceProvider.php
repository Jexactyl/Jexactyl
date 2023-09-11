<?php

namespace Jexactyl\Providers;

use Illuminate\Support\ServiceProvider;
use Jexactyl\Http\ViewComposers\StoreComposer;
use Jexactyl\Http\ViewComposers\SettingComposer;

class ViewComposerServiceProvider extends ServiceProvider
{
    /**
     * Register bindings in the container.
     */
    public function boot()
    {
        $this->app->make('view')->composer('*', SettingComposer::class);
        $this->app->make('view')->composer('*', StoreComposer::class);
    }
}
