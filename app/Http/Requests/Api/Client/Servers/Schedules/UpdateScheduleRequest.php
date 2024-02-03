<?php

namespace Everest\Http\Requests\Api\Client\Servers\Schedules;

use Everest\Models\Permission;

class UpdateScheduleRequest extends StoreScheduleRequest
{
    public function permission(): string
    {
        return Permission::ACTION_SCHEDULE_UPDATE;
    }
}
