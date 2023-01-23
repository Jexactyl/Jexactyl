<?php

namespace Jexactyl\Http\Requests\Api\Client\Servers\Schedules;

use Jexactyl\Models\Permission;

class UpdateScheduleRequest extends StoreScheduleRequest
{
    public function permission(): string
    {
        return Permission::ACTION_SCHEDULE_UPDATE;
    }
}
