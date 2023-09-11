<?php

namespace Jexactyl\Http\Requests\Admin;

use Jexactyl\Models\DatabaseHost;
use Illuminate\Contracts\Validation\Validator;

class DatabaseHostFormRequest extends AdminFormRequest
{
    public function rules(): array
    {
        if ($this->method() !== 'POST') {
            return DatabaseHost::getRulesForUpdate($this->route()->parameter('host'));
        }

        return DatabaseHost::getRules();
    }

    /**
     * Modify submitted data before it is passed off to the validator.
     */
    protected function getValidatorInstance(): Validator
    {
        if (!$this->filled('node_id')) {
            $this->merge(['node_id' => null]);
        }

        return parent::getValidatorInstance();
    }
}
