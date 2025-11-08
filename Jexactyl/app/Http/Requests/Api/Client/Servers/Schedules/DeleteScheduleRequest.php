<?php

namespace Everest\Http\Requests\Api\Client\Servers\Schedules;

use Everest\Models\Permission;

class DeleteScheduleRequest extends ViewScheduleRequest
{
    public function permission(): string
    {
        return Permission::ACTION_SCHEDULE_DELETE;
    }
}
