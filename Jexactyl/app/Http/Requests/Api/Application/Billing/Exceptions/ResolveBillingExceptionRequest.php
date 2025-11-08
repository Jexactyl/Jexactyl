<?php

namespace Everest\Http\Requests\Api\Application\Billing\Exceptions;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class ResolveBillingExceptionRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::BILLING_EXCEPTIONS;
    }
}
