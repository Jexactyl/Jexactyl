<?php

namespace Everest\Http\Controllers\Api\Application\Billing;

use Everest\Models\Setting;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Models\Billing\Order;
use Everest\Models\Billing\Product;
use Everest\Models\Billing\Category;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;
use Everest\Http\Requests\Api\Application\Billing\DeleteStripeKeysRequest;
use Everest\Http\Requests\Api\Application\Billing\GetBillingAnalyticsRequest;
use Everest\Http\Requests\Api\Application\Billing\UpdateBillingSettingsRequest;

class BillingController extends ApplicationApiController
{
    /**
     * BillingController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Update the billing settings for the Panel.
     *
     * @throws \Throwable
     */
    public function settings(UpdateBillingSettingsRequest $request): Response
    {
        // todo(jex): use normalized request with foreach key value pairs
        Setting::set('settings::modules:billing:' . $request->input('key'), $request->input('value'));

        if (strpos($request['key'], 'keys:') !== 0) {
            Activity::event('admin:billing:update')
                ->property('settings', $request->all())
                ->description('Jexactyl billing settings were updated')
                ->log();
        }

        return $this->returnNoContent();
    }

    /**
     * Gather and return billing analytics.
     */
    public function analytics(GetBillingAnalyticsRequest $request): array
    {
        return [
            'orders' => Order::all(),
            'categories' => Category::all(),
            'products' => Product::all(),
        ];
    }

    /**
     * Delete all Stripe API keys saved to the Panel.
     */
    public function resetKeys(DeleteStripeKeysRequest $request): Response
    {
        Setting::forget('settings::modules:billing:keys:publishable');
        Setting::forget('settings:modules:billing:keys:secret');

        Activity::event('admin:billing:reset-keys')
            ->description('Stripe API keys for billing were reset')
            ->log();

        return $this->returnNoContent();
    }
}
