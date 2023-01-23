<?php

namespace Jexactyl\Http\Requests\Admin;

use Jexactyl\Models\Location;

class LocationFormRequest extends AdminFormRequest
{
    /**
     * Set up the validation rules to use for these requests.
     */
    public function rules(): array
    {
        if ($this->method() === 'PATCH') {
            return Location::getRulesForUpdate($this->route()->parameter('location')->id);
        }

        return Location::getRules();
    }
}
