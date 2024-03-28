<?php

namespace Everest\Providers;

use Illuminate\Support\ServiceProvider;
use Everest\Http\ViewComposers\AssetComposer;
use Everest\Http\ViewComposers\EverestComposer;

class ViewComposerServiceProvider extends ServiceProvider
{
    /**
     * Register bindings in the container.
     */
    public function boot(): void
    {
        $this->app->make('view')->composer('*', AssetComposer::class);
        $this->app->make('view')->composer('*', EverestComposer::class);
    }
}
