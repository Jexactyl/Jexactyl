<?php

namespace Everest\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LogController extends ClientApiController
{
    public function store(Request $request): Response
    {
        logger()->error('Frontend error: ' . $request->input('message'), [
            'context' => $request->input('context'),
            'url' => $request->input('url'),
        ]);

        return $this->returnNoContent();
    }
}
