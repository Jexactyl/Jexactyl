<?php

namespace Jexactyl\Exceptions\Service\Database;

use Jexactyl\Exceptions\JexactylException;

class DatabaseClientFeatureNotEnabledException extends JexactylException
{
    public function __construct()
    {
        parent::__construct('Client database creation is not enabled in this Panel.');
    }
}
