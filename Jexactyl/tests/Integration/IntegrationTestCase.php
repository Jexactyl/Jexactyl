<?php

namespace Everest\Tests\Integration;

use Everest\Tests\TestCase;
use Everest\Events\ActivityLogged;
use Illuminate\Support\Facades\Event;
use Everest\Tests\Assertions\AssertsActivityLogged;
use Everest\Tests\Traits\Integration\CreatesTestModels;

abstract class IntegrationTestCase extends TestCase
{
    use CreatesTestModels;
    use AssertsActivityLogged;

    protected $defaultHeaders = [
        'Accept' => 'application/json',
    ];

    public function setUp(): void
    {
        parent::setUp();

        Event::fake(ActivityLogged::class);
    }
}
