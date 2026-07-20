<?php

namespace Everest\Facades;

use Illuminate\Support\Facades\Facade;
use Everest\Services\Activity\ActivityLogTargetableService;

/**
 * @mixin \Pterodactyl\Services\Activity\ActivityLogTargetableService
 */
class LogTarget extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ActivityLogTargetableService::class;
    }
}
