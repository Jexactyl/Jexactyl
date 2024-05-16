<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Illuminate\Http\Request;
use Everest\Models\Billing\BillingPlan;
use Everest\Transformers\Api\Client\BillingPlanTransformer;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class PlanController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the billing plans that have been configured for a user.
     */
    public function index(Request $request): array
    {
        $plans = BillingPlan::where('user_id', $request->user()->id)->orderBy('created_at', 'desc')->get();

        return $this->fractal->collection($plans)
            ->transformWith(BillingPlanTransformer::class)
            ->toArray();
    }

    /**
     * View a specific plan.
     */
    public function view(int $id): array
    {
        $plan = BillingPlan::findOrFail($id);

        return $this->fractal->item($plan)
            ->transformWith(BillingPlanTransformer::class)
            ->toArray();
    }

    /**
     * Cancel a subscription immediately.
     */
    public function cancel(Request $request, string $id): array
    {
        $plan = BillingPlan::where('uuid', $id)->first();

        dd($request->user()->subscription(substr($id, 0, 8)));

        $request->user()->subscription(substr($id, 0, 8))->cancelNow();

        $plan->update(['state' => 'cancelling']);

        return $this->fractal->item($plan)
            ->transformWith(BillingPlanTransformer::class)
            ->toArray();
    }
}
