<?php

namespace Everest\Http\Requests\Api\Application\Settings;

use Illuminate\Validation\Rule;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class MailSettingsFormRequest extends ApplicationApiRequest
{
    /**
     * Return rules to validate mail settings POST data against.
     */
    public function rules(): array
    {
        return [
            'host' => 'required|string',
            'port' => 'required|integer|between:1,65535',
            'encryption' => ['present', Rule::in([null, 'tls', 'ssl'])],
            'username' => 'nullable|string|max:191',
            'password' => 'nullable|string|max:191',
            'fromAddress' => 'required|string|email',
            'fromName' => 'nullable|string|max:191',
        ];
    }

    /**
     * Override the default normalization function for this type of request
     * as we need to accept empty values on the keys.
     */
    public function normalize(array $only = null): array
    {
        $keys = array_flip(array_keys($this->rules()));

        if (empty($this->input('password'))) {
            unset($keys['password']);
        }

        return $this->only(array_flip($keys));
    }
}
