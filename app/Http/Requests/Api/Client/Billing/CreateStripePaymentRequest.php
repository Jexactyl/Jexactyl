<?php

namespace Everest\Http\Requests\Api\Client\Billing;

use Everest\Http\Requests\Api\Client\ClientApiRequest;

class CreateStripePaymentRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'product_id' => 'required|int|exists:products,id',
            'node_id' => 'nullable|int|exists:nodes,id',
            'server_id' => 'nullable|int|exists:servers,id',
            'egg_id' => 'nullable|int|exists:eggs,id',
            'variables' => 'nullable|array',
            'discount_code' => 'nullable|string|exists:discount_codes,code',
        ];
    }
}
