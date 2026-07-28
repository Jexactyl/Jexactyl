<?php

namespace Everest\Http\Requests\Api\Client\Servers;

use Everest\Models\Permission;
use Everest\Http\Requests\Api\Client\ClientApiRequest;

class QueryAIRequest extends ClientApiRequest
{
    /**
     * The AI assistant is used to help debug a running server, so gate it behind the
     * same permission required to interact with the server console.
     */
    public function permission(): string
    {
        return Permission::ACTION_CONTROL_CONSOLE;
    }

    /**
     * Also require that the panel administrator has explicitly opted to expose the AI
     * module to client users (as opposed to leaving it enabled for admin-only use via
     * the application API).
     */
    public function authorize(): bool
    {
        return config('modules.ai.user_access') && parent::authorize();
    }

    public function rules(): array
    {
        return [
            'query' => 'required|string|min:1|max:2000',
        ];
    }
}
