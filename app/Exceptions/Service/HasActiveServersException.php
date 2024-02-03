<?php

namespace Everest\Exceptions\Service;

use Illuminate\Http\Response;
use Everest\Exceptions\DisplayException;

class HasActiveServersException extends DisplayException
{
    public function getStatusCode(): int
    {
        return Response::HTTP_BAD_REQUEST;
    }
}
