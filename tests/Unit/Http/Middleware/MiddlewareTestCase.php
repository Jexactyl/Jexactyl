<?php

namespace Jexactyl\Tests\Unit\Http\Middleware;

use Jexactyl\Tests\TestCase;
use Jexactyl\Tests\Traits\Http\RequestMockHelpers;
use Jexactyl\Tests\Traits\Http\MocksMiddlewareClosure;
use Jexactyl\Tests\Assertions\MiddlewareAttributeAssertionsTrait;

abstract class MiddlewareTestCase extends TestCase
{
    use MiddlewareAttributeAssertionsTrait;
    use MocksMiddlewareClosure;
    use RequestMockHelpers;

    /**
     * Setup tests with a mocked request object and normal attributes.
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->buildRequestMock();
    }
}
