<?php
/**
 * Pterodactyl CHINA - Panel
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'exceptions' => [
        'no_new_default_allocation' => '您正在试图删除此服务器实例的默认分配，但没有可供使用的备用分配。',
        'marked_as_failed' => '由于该服务器实例之前被标记为安装失败。在此状态下无法切换当前状态。',
        'bad_variable' => ':name 变量存在验证错误。',
        'daemon_exception' => '尝试与守护程序通信时出现异常，导致 HTTP/:code 响应代码。已记录此异常。(请求 id: :request_id)',
        'default_allocation_not_found' => '在此服务器实例的分配中找不到所请求的默认分配。',
    ],
    'alerts' => [
        'startup_changed' => '该服务器实例的启动配置已经更新。如果此服务器实例的预设组或预设被更改，现在将进行重新安装。',
        'server_deleted' => '服务器实例已成功从系统中删除。',
        'server_created' => '服务器实例已在面板上成功创建。请允许守护进程用几分钟的时间来完成安装此服务器实例。',
        'build_updated' => '此服务器实例的构建设置已更新。某些更改可能需要重新启动才能生效。',
        'suspension_toggled' => '服务器实例已从冻结状态更改为 :status。',
        'rebuild_on_boot' => '该服务器实例已标记为需要 Docker 容器重建。这将在下次启动服务器实例时执行该操作。',
        'install_toggled' => '该服务器实例的安装状态已被切换。',
        'server_reinstalled' => '此服务器实例已进入等候队列，马上重新安装。',
        'details_updated' => '服务器实例详细信息已成功更新。',
        'docker_image_updated' => '已成功更改用于此服务器实例的默认 Docker 镜像。需要重新启动才能应用此更改。',
        'node_required' => '您必须至少配置一个节点，然后才能将服务器实例添加到此面板。',
        'transfer_nodes_required' => '您必须至少配置两个节点，然后才能转移服务器实例。',
        'transfer_started' => '服务器实例转移已开始。',
        'transfer_not_viable' => '您选择的节点没有足够的存储空间或内存来容纳此服务器实例。',
    ],
];
