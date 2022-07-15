<?php

namespace Pterodactyl\Exceptions\Service\Backup;

use Pterodactyl\Exceptions\DisplayException;

class BackupLockedException extends DisplayException
{
    /**
     * TooManyBackupsException constructor.
     */
    public function __construct()
    {
        parent::__construct('不能删除标记为锁定的备份。');
    }
}
