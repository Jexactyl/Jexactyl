<?php

namespace Everest\Http\Requests\Api\Client\Account;

use Everest\Http\Requests\Api\Client\ClientApiRequest;

class StoreTicketRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:1|max:191',
            'message' => 'required|string|min:1|max:4000',
        ];
    }
}
