<?php

namespace Jexactyl\Facades;

use Illuminate\Support\Facades\Facade;
use Jexactyl\Services\Activity\ActivityLogTargetableService;

class LogTarget extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ActivityLogTargetableService::class;
    }
}
