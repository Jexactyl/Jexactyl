<?php

namespace Pterodactyl\Exceptions\Service\Database;

use Pterodactyl\Exceptions\DisplayException;

class NoSuitableDatabaseHostException extends DisplayException
{
    /**
     * NoSuitableDatabaseHostException constructor.
     */
    public function __construct()
    {
        parent::__construct('未找到满足此服务器要求的数据库主机。');
    }
}
