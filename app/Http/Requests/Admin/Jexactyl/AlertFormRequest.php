<?php

namespace Jexactyl\Http\Requests\Admin\Jexactyl;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class AlertFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'alert:message' => 'required|string|min:3|max:191',
            'alert:type' => 'required|in:success,info,warning,danger',
        ];
    }
}
