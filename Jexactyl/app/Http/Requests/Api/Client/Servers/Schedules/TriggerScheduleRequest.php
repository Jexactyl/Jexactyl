<?php

namespace Everest\Http\Requests\Api\Client\Servers\Schedules;

use Everest\Models\Permission;
use Everest\Http\Requests\Api\Client\ClientApiRequest;

class TriggerScheduleRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return Permission::ACTION_SCHEDULE_UPDATE;
    }

    public function rules(): array
    {
        return [];
    }
}
