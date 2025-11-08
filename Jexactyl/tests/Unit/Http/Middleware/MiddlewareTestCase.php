<?php

namespace Everest\Tests\Unit\Http\Middleware;

use Everest\Tests\TestCase;
use Everest\Tests\Traits\Http\RequestMockHelpers;
use Everest\Tests\Traits\Http\MocksMiddlewareClosure;
use Everest\Tests\Assertions\MiddlewareAttributeAssertionsTrait;

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
