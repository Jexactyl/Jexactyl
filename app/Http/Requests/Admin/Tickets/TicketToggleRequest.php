<?php

namespace Pterodactyl\Http\Requests\Admin\Tickets;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class TicketToggleRequest extends AdminFormRequest
{
    /**
     * Rules to apply to requests for updating the status
     * of a ticket in the admin control panel.
     */
    public function rules(): array
    {
        return [
            'enabled' => 'required|in:true,false',
            'max' => 'required|min:0|max:10',
        ];
    }
}
