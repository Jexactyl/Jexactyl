<?php

namespace Everest\Http\Requests\Api\Application\Webhooks;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class TestWebhookURIRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::WEBHOOKS_UPDATE;
    }
}
