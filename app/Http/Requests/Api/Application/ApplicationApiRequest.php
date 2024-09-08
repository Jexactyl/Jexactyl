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

    /**
     * Return only the fields that we are interested in from the request.
     * This will include empty fields as a null value.
     */
    public function normalize(array $only = null): array
    {
        return $this->only($only ?? array_keys($this->rules()));
    }
}
