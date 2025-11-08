<?php

namespace Everest\Http\Requests\Api\Application\Tickets;

use Everest\Models\Ticket;
use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class DeleteTicketRequest extends ApplicationApiRequest
{
    public function permission(): string
    {
        return AdminRole::TICKETS_DELETE;
    }
}
