<?php

namespace Everest\Http\Requests\Api\Application\Billing\Orders;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class GetBillingOrdersRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::BILLING_ORDERS;
    }
}
