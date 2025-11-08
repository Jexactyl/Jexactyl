<?php

namespace Everest\Exceptions\Service\Allocation;

use Everest\Exceptions\DisplayException;

class NoAutoAllocationSpaceAvailableException extends DisplayException
{
    /**
     * NoAutoAllocationSpaceAvailableException constructor.
     */
    public function __construct()
    {
        parent::__construct(
            'Cannot assign additional allocation: no more space available on node.'
        );
    }
}
