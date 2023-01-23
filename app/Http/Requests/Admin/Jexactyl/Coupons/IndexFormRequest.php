<?php

namespace Jexactyl\Http\Requests\Admin\Jexactyl\Coupons;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class IndexFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'enabled' => 'required|boolean',
        ];
    }
}
