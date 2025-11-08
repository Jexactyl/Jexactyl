<?php

namespace Everest\Http\Requests\Api\Application\Webhooks;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class ToggleWebhookEventRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return [
            'id' => 'nullable|int|exists:webhook_events,id',
            'enabled' => 'required|bool',
        ];
    }

    public function permission(): string
    {
        return AdminRole::WEBHOOKS_UPDATE;
    }
}
