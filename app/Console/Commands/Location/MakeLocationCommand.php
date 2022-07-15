<?php
/**
 * Pterodactyl - Panel
 * Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

namespace Pterodactyl\Console\Commands\Location;

use Illuminate\Console\Command;
use Pterodactyl\Services\Locations\LocationCreationService;

class MakeLocationCommand extends Command
{
    /**
     * @var \Pterodactyl\Services\Locations\LocationCreationService
     */
    protected $creationService;

    /**
     * @var string
     */
    protected $signature = 'p:location:make
                            {--short= : 此节点服务器组的标识码名称（例如 us1）。}
                            {--long= : 此节点服务器组的描述。}';

    /**
     * @var string
     */
    protected $description = '通过 CLI 在系统上创建一个新节点服务器组。';

    /**
     * Create a new command instance.
     */
    public function __construct(LocationCreationService $creationService)
    {
        parent::__construct();

        $this->creationService = $creationService;
    }

    /**
     * Handle the command execution process.
     *
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     */
    public function handle()
    {
        $short = $this->option('short') ?? $this->ask(trans('command/messages.location.ask_short'));
        $long = $this->option('long') ?? $this->ask(trans('command/messages.location.ask_long'));

        $location = $this->creationService->handle(compact('short', 'long'));
        $this->line(trans('command/messages.location.created', [
            'name' => $location->short,
            'id' => $location->id,
        ]));
    }
}
