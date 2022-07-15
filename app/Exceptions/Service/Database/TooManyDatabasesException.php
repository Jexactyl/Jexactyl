<?php

namespace Pterodactyl\Exceptions\Service\Database;

use Pterodactyl\Exceptions\DisplayException;

class TooManyDatabasesException extends DisplayException
{
    public function __construct()
    {
        parent::__construct('操作中止：创建新数据库会使该服务器超出设定的限制。');
    }
}
