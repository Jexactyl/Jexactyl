<?php

namespace Everest\Facades;

use Illuminate\Support\Facades\Facade;
use Everest\Services\Activity\ActivityLogBatchService;

class LogBatch extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ActivityLogBatchService::class;
    }
}
