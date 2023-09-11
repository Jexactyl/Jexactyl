<?php

namespace Jexactyl\Tests\Integration;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Jexactyl\Tests\TestCase;
use Jexactyl\Events\ActivityLogged;
use Illuminate\Support\Facades\Event;
use Jexactyl\Tests\Assertions\AssertsActivityLogged;
use Jexactyl\Tests\Traits\Integration\CreatesTestModels;
use Jexactyl\Transformers\Api\Application\BaseTransformer;

abstract class IntegrationTestCase extends TestCase
{
    use CreatesTestModels;
    use AssertsActivityLogged;

    protected array $connectionsToTransact = ['mysql'];

    protected $defaultHeaders = [
        'Accept' => 'application/json',
    ];

    public function setUp(): void
    {
        parent::setUp();

        Event::fake(ActivityLogged::class);
    }

    /**
     * Return an ISO-8601 formatted timestamp to use in the API response.
     */
    protected function formatTimestamp(string $timestamp): string
    {
        return CarbonImmutable::createFromFormat(CarbonInterface::DEFAULT_TO_STRING_FORMAT, $timestamp)
            ->setTimezone(BaseTransformer::RESPONSE_TIMEZONE)
            ->toAtomString();
    }
}
