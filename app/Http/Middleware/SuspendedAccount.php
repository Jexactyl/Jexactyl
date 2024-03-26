<?php

namespace Everest\Http\Middleware;

use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class SuspendedAccount
{
    /**
     * Handle an incoming request.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException
     */
    public function handle(Request $request, \Closure $next): mixed
    {
        if (!$request->user() || $request->user()->state === 'suspended') {
            throw new AccessDeniedHttpException();
        }

        return $next($request);
    }
}
