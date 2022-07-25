<?php

/**
 * Pterodactyl CHINA - Panel
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

/**
 * Contains all of the translation strings for different activity log
 * events. These should be keyed by the value in front of the colon (:)
 * in the event name. If there is no colon present, they should live at
 * the top level.
 */
return [
    'auth' => [
        'fail' => '登录失败',
        'success' => '已登入',
        'password-reset' => '重设密码',
        'reset-password' => '请求密码重置',
        'checkpoint' => '请求动态口令认证',
        'recovery-token' => '使用了动态口令恢复代码',
        'token' => '正确输入了动态口令',
        'ip-blocked' => '阻止不在IP白名单里的请求',
        'sftp' => [
            'fail' => 'SFTP 登录失败',
        ],
    ],
    'user' => [
        'account' => [
            'email-changed' => '已将电子邮箱从 :old 更改为 :new',
            'password-changed' => '已更改密码',
        ],
        'api-key' => [
            'create' => '创建新的 API 密钥 :identifier',
            'delete' => '已删除 API 密钥 :identifier',
        ],
        'ssh-key' => [
            'create' => '将 SSH 私钥 :fingerprint 添加到帐户',
            'delete' => '从帐户中删除了 SSH 私钥 :fingerprint',
        ],
        'two-factor' => [
            'create' => '启用动态口令认证',
            'delete' => '禁用动态口令认证',
        ],
        'store' => [
            'resource-purchase' => '购买了一个资源',
        ],
    ],

    'server' => [
        'reinstall' => '重装服务器',
        'console' => [
            'command' => '在服务器上执行 ":command"',
        ],
        'power' => [
            'start' => '启动了服务器',
            'stop' => '停止了服务器',
            'restart' => '重启了服务器',
            'kill' => '强制停止了服务器',
        ],
        'backup' => [
            'download' => '下载了 :name 备份',
            'delete' => '删除了 :name 备份',
            'restore' => '恢复了 :name 备份 (已删除文件: :truncate)',
            'restore-complete' => '已成功恢复 :name 备份',
            'restore-failed' => ':name 备份恢复失败',
            'start' => ':name 开始了新的一轮备份',
            'complete' => '已将 :name 备份标记为完成',
            'fail' => '已将 :name 备份标记为失败',
            'lock' => '锁定了 :name 备份',
            'unlock' => '解锁了 :name 备份',
        ],
        'database' => [
            'create' => '创建新数据库 :name',
            'rotate-password' => '为数据库 :name 轮换密码',
            'delete' => '已删除数据库 :name',
        ],
        'file' => [
            'compress_one' => '压缩了 :directory:file',
            'compress_other' => '在 :directory 路径下压缩了 :count 个文件',
            'read' => '查看了 :file 的内容',
            'copy' => '创建了 :file 的副本',
            'create-directory' => '在 :directory 路径下创建了一个新目录 :name',
            'decompress' => '解压了 :directory 路径下的 :files',
            'delete_one' => '删除了 :directory:files.0',
            'delete_other' => '删除了 :directory 路径下的 :count 个文件',
            'download' => '下载 :file',
            'pull' => '从 :url 下载远程文件到 :directory 路径下',
            'rename_one' => '将 :directory:files.0.from 重命名为 :directory:files.0.to',
            'rename_other' => '在 :directory 路径下重命名了 :count 个文件',
            'write' => '写了一些新内容到 :file 中',
            'upload' => '上传了一些文件',
            'uploaded' => '已上传 :directory:file',
        ],
        'sftp' => [
            'denied' => '由于权限原因阻止了 SFTP 访问',
            'create_one' => '创建了 :files.0',
            'create_other' => '创建了新的 :count 文件',
            'write_one' => '修改了 :files.0 的内容',
            'write_other' => '修改了 :count 文件的内容',
            'delete_one' => '删除了 :files.0',
            'delete_other' => '删除了 :count 文件',
            'create-directory_one' => '创建了 :files.0 目录',
            'create-directory_other' => '创建了 :count 个目录',
            'rename_one' => '将 :files.0.from 重命名为 :files.0.to',
            'rename_other' => '重命名或移动了 :count 个文件',
        ],
        'allocation' => [
            'create' => '添加 :allocation 到服务器',
            'notes' => '将 :allocation 的备注从 ":old" 更新为 ":new"',
            'primary' => '将 :allocation 设置为服务器首选',
            'delete' => '删除了 :allocation 分配',
        ],
        'schedule' => [
            'create' => '创建了 :name 计划',
            'update' => '更新了 :name 计划',
            'execute' => '手动执行了 :name 计划',
            'delete' => '删除了 :name 计划',
        ],
        'task' => [
            'create' => '为 :name 计划创建了一个新的 ":action" 任务',
            'update' => '更新了 :name 计划的 ":action" 任务',
            'delete' => '删除了 :name 计划的一个任务',
        ],
        'settings' => [
            'rename' => '将服务器从 :old 重命名为 :new',
        ],
        'startup' => [
            'edit' => '将 :variable 变量从 ":old" 更改为 ":new"',
            'image' => '将服务器的 Docker 映像从 :old 更新为 :new',
        ],
        'subuser' => [
            'create' => '将 :email 添加为子用户',
            'update' => '更新了 :email 的子用户权限',
            'delete' => '将 :email 从子用户中删除',
        ],
    ],
];
