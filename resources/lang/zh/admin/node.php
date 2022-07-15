<?php
/**
 * Pterodactyl CHINA - Panel
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

return [
    'validation' => [
        'fqdn_not_resolvable' => '提供的 域名(FQDN) 或 IP 地址无法解析为有效的 IP 地址。',
        'fqdn_required_for_ssl' => '需要解析为公网 IP 地址的完全限定域名才能为此节点使用 SSL。',
    ],
    'notices' => [
        'allocations_added' => '分配已成功添加到此节点。',
        'node_deleted' => '节点已成功从面板中删除。',
        'location_required' => '您必须至少配置一个节点服务器组，然后才能将节点添加到此面板。',
        'node_created' => '成功创建新节点。您可以通过访问“配置”选项卡自动配置此机器上的守护程序。<strong>您必须先分配至少一个 IP 地址和端口，然后才能添加任意服务器。</strong>',
        'node_updated' => '节点信息已更新。如果更改了任何守护程序的设置，您将需要重新启动它以使这些更改生效。',
        'unallocated_deleted' => '删除了 <code>:ip</code> 的所有未分配端口。',
    ],
];
