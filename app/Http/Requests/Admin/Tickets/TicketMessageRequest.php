<?php

namespace Pterodactyl\Http\Requests\Admin\Tickets;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class TicketMessageRequest extends AdminFormRequest
{
    /**
     * Rules to apply to requests for updating the status
     * of a ticket in the admin control panel.
     */
    public function rules(): array
    {
        return [
            'content' => 'required|min:3|max:191',
        ];
    }
}
