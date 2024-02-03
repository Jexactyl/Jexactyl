<?php

namespace Everest\Http\Requests\Api\Application;

use Everest\Http\Requests\Api\ApiRequest;

abstract class ApplicationApiRequest extends ApiRequest
{
    /**
     * This will eventually be replaced with per-request permissions checking
     * on the API key and for the user.
     */
    public function authorize(): bool
    {
        return $this->user()->root_admin;
    }
}
