<?php

namespace Jexactyl\Http\Requests\Admin\Tickets;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

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
