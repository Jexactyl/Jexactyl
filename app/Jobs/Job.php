<?php

namespace Everest\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

abstract class Job
{
    use Queueable;
    use InteractsWithQueue;
    use SerializesModels;
}
