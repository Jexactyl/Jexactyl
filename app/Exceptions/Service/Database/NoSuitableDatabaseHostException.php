<?php

namespace Jexactyl\Exceptions\Service\Database;

use Jexactyl\Exceptions\DisplayException;

class NoSuitableDatabaseHostException extends DisplayException
{
    /**
     * NoSuitableDatabaseHostException constructor.
     */
    public function __construct()
    {
        parent::__construct('No database host was found that meets the requirements for this server.');
    }
}
