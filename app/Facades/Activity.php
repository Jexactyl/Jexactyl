<?php

namespace Jexactyl\Facades;

use Illuminate\Support\Facades\Facade;
use Jexactyl\Services\Activity\ActivityLogService;

class Activity extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ActivityLogService::class;
    }
}
