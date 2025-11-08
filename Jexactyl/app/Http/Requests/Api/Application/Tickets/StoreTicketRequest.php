<?php

namespace Everest\Http\Requests\Api\Application\Tickets;

use Everest\Models\Ticket;
use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class StoreTicketRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        return Ticket::rules();
    }

    public function permission(): string
    {
        return AdminRole::TICKETS_CREATE;
    }
}
