<?php

namespace Pterodactyl\Http\Requests\Admin\Jexactyl\Coupons;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class IndexFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'enabled' => 'required|boolean',
        ];
    }
}
