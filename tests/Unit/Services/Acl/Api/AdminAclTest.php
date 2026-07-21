<?php

namespace Everest\Tests\Unit\Services\Acl\Api;

use Mockery as m;
use Everest\Models\ApiKey;
use PHPUnit\Framework\TestCase;
use Everest\Services\Acl\Api\AdminAcl;

class AdminAclTest extends TestCase
{
    /**
     * Test that permissions return the expects values.
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('permissionsDataProvider')]
    public function testPermissions(int $permission, int $check, bool $outcome)
    {
        $this->assertSame($outcome, AdminAcl::can($permission, $check));
    }

    /**
     * Test that checking against a model works as expected.
     */
    public function testCheck()
    {
        $model = m::mock(ApiKey::class)->makePartial();
        $model->r_servers = AdminAcl::READ | AdminAcl::WRITE;

        $this->assertTrue(AdminAcl::check($model, AdminAcl::RESOURCE_SERVERS, AdminAcl::WRITE));
    }

    /**
     * Provide valid and invalid permissions combos for testing.
     */
    public static function permissionsDataProvider(): array
    {
        return [
            [AdminAcl::READ, AdminAcl::READ, true],
            [AdminAcl::READ | AdminAcl::WRITE, AdminAcl::READ, true],
            [AdminAcl::READ | AdminAcl::WRITE, AdminAcl::WRITE, true],
            [AdminAcl::WRITE, AdminAcl::WRITE, true],
            [AdminAcl::READ, AdminAcl::WRITE, false],
            [AdminAcl::NONE, AdminAcl::READ, false],
            [AdminAcl::NONE, AdminAcl::WRITE, false],
        ];
    }
}
