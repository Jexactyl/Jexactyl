<?php

namespace Everest\Http\Requests\Api\Application;

use Everest\Models\AdminRole;
use Everest\Http\Requests\Api\ApiRequest;

abstract class ApplicationApiRequest extends ApiRequest
{
    /**
     * Authorize users based on their Admin Role (if exists)
     * to allow admins to visit specific permissable endpoints.
     */
    public function authorize(): bool
    {
        if ($this->user()->root_admin) {
            return true;
        }

        $id = $this->user()->admin_role_id;

        if ($id) {
            if (method_exists($this, 'permission')) {
                $required = $this->permission();

                return in_array($required, AdminRole::find($id)->permissions ?? []);
            }

            return true;
        } else {
            return false;
        }
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
