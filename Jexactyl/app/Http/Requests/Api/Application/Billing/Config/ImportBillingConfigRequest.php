<?php

namespace Everest\Http\Requests\Api\Application\Billing\Config;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class ImportBillingConfigRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::BILLING_IMPORT;
    }
}
