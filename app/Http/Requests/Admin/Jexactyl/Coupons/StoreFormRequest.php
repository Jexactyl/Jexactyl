<?php

namespace Jexactyl\Http\Requests\Admin\Jexactyl\Coupons;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class StoreFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'code' => 'required|string',
            'uses' => 'required|integer',
            'credits' => 'required|integer',
            'expires' => 'nullable|integer',
        ];
    }
}
