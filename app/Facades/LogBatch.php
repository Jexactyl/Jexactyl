<?php

namespace Jexactyl\Facades;

use Illuminate\Support\Facades\Facade;
use Jexactyl\Services\Activity\ActivityLogBatchService;

class LogBatch extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ActivityLogBatchService::class;
    }
}
