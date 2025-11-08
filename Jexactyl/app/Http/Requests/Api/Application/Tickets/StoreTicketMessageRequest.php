<?php

namespace Everest\Http\Requests\Api\Application\Tickets;

use Everest\Models\AdminRole;
use Everest\Models\TicketMessage;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreTicketMessageRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return TicketMessage::rules();
    }

    public function permission(): string
    {
        return AdminRole::TICKETS_MESSAGE;
    }
}
