<?php

namespace Pterodactyl\Exceptions\Http;

use Throwable;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class TwoFactorAuthRequiredException extends HttpException implements HttpExceptionInterface
{
    /**
     * TwoFactorAuthRequiredException constructor.
     */
    public function __construct(Throwable $previous = null)
    {
        parent::__construct(Response::HTTP_BAD_REQUEST, '此帐户需要动态口令认证才能访问此端点。', $previous);
    }
}
