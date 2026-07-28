<?php

namespace Everest\Http\Requests\Api\Client\Account;

use Everest\Http\Requests\Api\Client\ClientApiRequest;

class AddTicketMessageRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'message' => 'required|string|min:1|max:4000',
        ];
    }
}
