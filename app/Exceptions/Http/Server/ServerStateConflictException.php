<?php

namespace Pterodactyl\Exceptions\Http\Server;

use Throwable;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ServerStateConflictException extends ConflictHttpException
{
    /**
     * Exception thrown when the server is in an unsupported state for API access or
     * certain operations within the codebase.
     */
    public function __construct(Server $server, Throwable $previous = null)
    {
        $message = '此服务器目前处于不受支持的状态，请稍后再试。';
        if ($server->isSuspended()) {
            $message = '此服务器已被停用，请求的功能不可用。';
        } elseif (!$server->isInstalled()) {
            $message = '此服务器尚未完成安装过程，请稍后再试。';
        } elseif ($server->status === Server::STATUS_RESTORING_BACKUP) {
            $message = '此服务器当前正在从备份中恢复，请稍后再试。';
        } elseif (!is_null($server->transfer)) {
            $message = '此服务器目前正在转移到新主机上，请稍后再试。';
        }

        parent::__construct($message, $previous);
    }
}
