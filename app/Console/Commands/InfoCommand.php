<?php
/**
 * Pterodactyl CHINA - Panel
 * Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com>.
 * Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com>
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Pterodactyl\Services\Helpers\SoftwareVersionService;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class InfoCommand extends Command
{
    /**
     * @var string
     */
    protected $description = 'Displays the application, database, and email configurations along with the panel version.';

    /**
     * @var \Illuminate\Contracts\Config\Repository
     */
    protected $config;

    /**
     * @var string
     */
    protected $signature = 'p:info';

    /**
     * @var \Pterodactyl\Services\Helpers\SoftwareVersionService
     */
    protected $versionService;

    /**
     * VersionCommand constructor.
     */
    public function __construct(ConfigRepository $config, SoftwareVersionService $versionService)
    {
        parent::__construct();

        $this->config = $config;
        $this->versionService = $versionService;
    }

    /**
     * Handle execution of command.
     */
    public function handle()
    {
        $this->output->title('版本信息');
        $this->table([], [
            ['面板版本', $this->config->get('app.version')],
            ['最新版本', $this->versionService->getPanel()],
            ['是否为最新版', $this->versionService->isLatestPanel() ? '是' : $this->formatText('否', 'bg=red')],
            ['服务作者', $this->config->get('pterodactyl.service.author')],
        ], 'compact');

        $this->output->title('应用配置');
        $this->table([], [
            ['环境', $this->formatText($this->config->get('app.env'), $this->config->get('app.env') === 'production' ?: 'bg=red')],
            ['是否处于调试模式', $this->formatText($this->config->get('app.debug') ? '是' : '否', !$this->config->get('app.debug') ?: 'bg=red')],
            ['安装 URL', $this->config->get('app.url')],
            ['安装路径', base_path()],
            ['时区', $this->config->get('app.timezone')],
            ['Cache 缓存驱动器', $this->config->get('cache.default')],
            ['Queue 队列驱动器', $this->config->get('queue.default')],
            ['Session 会话驱动器', $this->config->get('session.driver')],
            ['Filesystem 文件系统驱动器', $this->config->get('filesystems.default')],
            ['默认主题', $this->config->get('themes.active')],
            ['代理', $this->config->get('trustedproxies.proxies')],
        ], 'compact');

        $this->output->title('数据库配置');
        $driver = $this->config->get('database.default');
        $this->table([], [
            ['驱动器', $driver],
            ['主机', $this->config->get("database.connections.{$driver}.host")],
            ['端口', $this->config->get("database.connections.{$driver}.port")],
            ['数据库', $this->config->get("database.connections.{$driver}.database")],
            ['用户名', $this->config->get("database.connections.{$driver}.username")],
        ], 'compact');

        $this->output->title('邮件发件配置');
        $this->table([], [
            ['驱动器', $this->config->get('mail.driver')],
            ['主机', $this->config->get('mail.host')],
            ['端口', $this->config->get('mail.port')],
            ['用户名', $this->config->get('mail.username')],
            ['发件地址', $this->config->get('mail.from.address')],
            ['发件人', $this->config->get('mail.from.name')],
            ['加密方式', $this->config->get('mail.encryption')],
        ], 'compact');
    }

    /**
     * Format output in a Name: Value manner.
     *
     * @param string $value
     * @param string $opts
     *
     * @return string
     */
    private function formatText($value, $opts = '')
    {
        return sprintf('<%s>%s</>', $opts, $value);
    }
}
