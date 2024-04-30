<?php

namespace Everest\Http\Controllers\Api\Client\Billing;

use Illuminate\Http\Request;
use Everest\Http\Controllers\Api\Client\ClientApiController;

class BillingController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns all the variables of an egg.
     */
    public function billingPortalUrl(Request $request): string
    {
        return $request->user()->billingPortalUrl(route('index'));
    }
}
