<?php

namespace Jexactyl\Http\Requests\Admin\Node;

use Jexactyl\Rules\Fqdn;
use Jexactyl\Models\Node;
use Jexactyl\Http\Requests\Admin\AdminFormRequest;

class NodeFormRequest extends AdminFormRequest
{
    /**
     * Get rules to apply to data in this request.
     */
    public function rules(): array
    {
        if ($this->method() === 'PATCH') {
            return Node::getRulesForUpdate($this->route()->parameter('node'));
        }

        $data = Node::getRules();
        $data['fqdn'][] = Fqdn::make('scheme');

        return $data;
    }
}
