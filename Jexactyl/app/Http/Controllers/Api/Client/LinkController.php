<?php

namespace Everest\Http\Controllers\Api\Client;

use Everest\Models\CustomLink;
use Everest\Transformers\Api\Client\LinkTransformer;
use Everest\Http\Requests\Api\Client\ClientApiRequest;

class LinkController extends ClientApiController
{
    /**
     * Returns a list of all visible links.
     */
    public function index(ClientApiRequest $request): array
    {
        $links = CustomLink::where('visible', true)->get();

        return $this->fractal->collection($links)
            ->transformWith(LinkTransformer::class)
            ->toArray();
    }
}
