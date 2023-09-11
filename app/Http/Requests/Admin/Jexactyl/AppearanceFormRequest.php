<?php

namespace Jexactyl\Http\Requests\Admin\Jexactyl;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class AppearanceFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'app:name' => 'required|string|max:191',
            'app:logo' => 'required|string|max:191',
            'theme:user:background' => 'nullable|url',
            'theme:admin' => 'required|string|in:jexactyl,dark,light,blue,minecraft',
        ];
    }
}
