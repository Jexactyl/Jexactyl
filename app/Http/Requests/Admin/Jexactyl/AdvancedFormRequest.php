<?php

namespace Jexactyl\Http\Requests\Admin\Jexactyl;

use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class AdvancedFormRequest extends AdminFormRequest
{
    /**
     * Return all the rules to apply to this request's data.
     */
    public function rules(): array
    {
        return [
            'Jexactyl:auth:2fa_required' => 'required|integer|in:0,1,2',

            'recaptcha:enabled' => 'required|in:true,false',
            'recaptcha:secret_key' => 'required|string|max:191',
            'recaptcha:website_key' => 'required|string|max:191',
            'Jexactyl:guzzle:timeout' => 'required|integer|between:1,60',
            'Jexactyl:guzzle:connect_timeout' => 'required|integer|between:1,60',

            'Jexactyl:client_features:allocations:enabled' => 'required|in:true,false',
            'Jexactyl:client_features:allocations:range_start' => [
                'nullable',
                'required_if:Jexactyl:client_features:allocations:enabled,true',
                'integer',
                'between:1024,65535',
            ],
            'Jexactyl:client_features:allocations:range_end' => [
                'nullable',
                'required_if:Jexactyl:client_features:allocations:enabled,true',
                'integer',
                'between:1024,65535',
                'gt:Jexactyl:client_features:allocations:range_start',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'recaptcha:enabled' => 'reCAPTCHA Enabled',
            'recaptcha:secret_key' => 'reCAPTCHA Secret Key',
            'recaptcha:website_key' => 'reCAPTCHA Website Key',
            'Jexactyl:guzzle:timeout' => 'HTTP Request Timeout',
            'Jexactyl:guzzle:connect_timeout' => 'HTTP Connection Timeout',
            'Jexactyl:client_features:allocations:enabled' => 'Auto Create Allocations Enabled',
            'Jexactyl:client_features:allocations:range_start' => 'Starting Port',
            'Jexactyl:client_features:allocations:range_end' => 'Ending Port',
        ];
    }
}
