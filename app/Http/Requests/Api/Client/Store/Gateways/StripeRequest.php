<?php

namespace Jexactyl\Http\Requests\Api\Client\Store\Gateways;

use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;

class StripeRequest extends ClientApiRequest
{
    /**
     * Rules to validate this request against.
     */
    public function rules(): array
    {
        return [
            'amount' => 'required|int',
        ];
    }
}
