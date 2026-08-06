<?php

namespace Everest\Providers;

use Carbon\Carbon;
use Everest\Models;
use Everest\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Paginator::useBootstrap();

        // If the APP_URL value is set with https:// make sure we force it here. Theoretically
        // this should just work with the proxy logic, but there are a lot of cases where it
        // doesn't, and it triggers a lot of support requests, so lets just head it off here.
        //
        // @see https://github.com/pterodactyl/panel/issues/3623
        if (Str::startsWith(config('app.url') ?? '', 'https://')) {
            URL::forceScheme('https');
        }

        Relation::enforceMorphMap([
            'allocation' => Models\Allocation::class,
            'api_key' => Models\ApiKey::class,
            'backup' => Models\Backup::class,
            'database' => Models\Database::class,
            'database_host' => Models\DatabaseHost::class,
            'egg' => Models\Egg::class,
            'egg_variable' => Models\EggVariable::class,
            'schedule' => Models\Schedule::class,
            'server' => Models\Server::class,
            'server_preset' => Models\ServerPreset::class,
            'ssh_key' => Models\UserSSHKey::class,
            'passkey' => Models\UserPasskey::class,
            'ticket' => Models\Ticket::class,
            'task' => Models\Task::class,
            'link' => Models\CustomLink::class,
            'user' => User::class,
            'node' => Models\Node::class,
            'nest' => Models\Nest::class,
            'admin_role' => Models\AdminRole::class,
            'billing_category' => Models\Billing\Category::class,
            'billing_product' => Models\Billing\Product::class,
            'billing_discount_code' => Models\Billing\DiscountCode::class,
            'billing_exception' => Models\Billing\BillingException::class,
            'billing_order' => Models\Billing\Order::class,
            'billing_invoice' => Models\Billing\Invoice::class,
        ]);

        Carbon::serializeUsing(fn ($carbon) => $carbon->utc()->toIso8601ZuluString());
    }

    /**
     * Register application service providers.
     */
    public function register(): void
    {
        // Only load the settings / theme service provider if the environment
        // is configured to allow it.
        if (!config('everest.load_environment_only', false) && $this->app->environment() !== 'testing') {
            $this->app->register(SettingsServiceProvider::class);
            $this->app->register(ThemeServiceProvider::class);
        }
    }
}
