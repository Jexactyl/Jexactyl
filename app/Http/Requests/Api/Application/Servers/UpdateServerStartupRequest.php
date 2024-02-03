<?php

namespace Everest\Http\Requests\Api\Application\Servers;

use Everest\Models\Server;
use Everest\Http\Requests\Api\Application\ApplicationApiRequest;

class UpdateServerStartupRequest extends ApplicationApiRequest
{
    public function rules(): array
    {
        $rules = Server::getRulesForUpdate($this->route()->parameter('server'));

        return [
            'startup' => $rules['startup'],
            'environment' => 'present|array',
            'egg_id' => $rules['egg_id'],
            'image' => $rules['image'],
            'skip_scripts' => 'present|boolean',
        ];
    }
}
