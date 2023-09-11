<?php

namespace Jexactyl\Tests\Unit\Helpers;

use Jexactyl\Tests\TestCase;
use Jexactyl\Traits\Commands\EnvironmentWriterTrait;

class EnvironmentWriterTraitTest extends TestCase
{
    /**
     * @dataProvider variableDataProvider
     */
    public function testVariableIsEscapedProperly($input, $expected)
    {
        $output = (new FooClass())->escapeEnvironmentValue($input);

        $this->assertSame($expected, $output);
    }

    public function variableDataProvider(): array
    {
        return [
            ['foo', 'foo'],
            ['abc123', 'abc123'],
            ['val"ue', '"val\"ue"'],
            ['my test value', '"my test value"'],
            ['mysql_p@assword', '"mysql_p@assword"'],
            ['mysql_p#assword', '"mysql_p#assword"'],
            ['mysql p@$$word', '"mysql p@$$word"'],
            ['mysql p%word', '"mysql p%word"'],
            ['mysql p#word', '"mysql p#word"'],
            ['abc_@#test', '"abc_@#test"'],
            ['test 123 $$$', '"test 123 $$$"'],
            ['#password%', '"#password%"'],
            ['$pass ', '"$pass "'],
        ];
    }
}

class FooClass
{
    use EnvironmentWriterTrait;
}
