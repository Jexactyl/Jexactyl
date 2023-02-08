<?php

namespace Jexactyl\Services\Eggs\Sharing;

use Carbon\Carbon;
use Jexactyl\Models\Egg;
use Jexactyl\Models\EggVariable;
use Illuminate\Support\Collection;
use Jexactyl\Contracts\Repository\EggRepositoryInterface;

class EggExporterService
{
    /**
     * EggExporterService constructor.
     */
    public function __construct(protected EggRepositoryInterface $repository)
    {
    }

    /**
     * Return a JSON representation of an egg and its variables.
     *
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function handle(int $egg): string
    {
        $egg = $this->repository->getWithExportAttributes($egg);

        $struct = [
            '_comment' => 'DO NOT EDIT: FILE GENERATED AUTOMATICALLY BY Jexactyl PANEL - jexactyl.com',
            'meta' => [
                'version' => Egg::EXPORT_VERSION,
                'update_url' => $egg->update_url,
            ],
            'exported_at' => Carbon::now()->toAtomString(),
            'name' => $egg->name,
            'author' => $egg->author,
            'description' => $egg->description,
            'features' => $egg->features,
            'docker_images' => $egg->docker_images,
            'file_denylist' => Collection::make($egg->inherit_file_denylist)->filter(function ($value) {
                return !empty($value);
            }),
            'startup' => $egg->startup,
            'config' => [
                'files' => $egg->inherit_config_files,
                'startup' => $egg->inherit_config_startup,
                'logs' => $egg->inherit_config_logs,
                'stop' => $egg->inherit_config_stop,
            ],
            'scripts' => [
                'installation' => [
                    'script' => $egg->copy_script_install,
                    'container' => $egg->copy_script_container,
                    'entrypoint' => $egg->copy_script_entry,
                ],
            ],
            'variables' => $egg->variables->transform(function (EggVariable $item) {
                return Collection::make($item->toArray())
                    ->except(['id', 'egg_id', 'created_at', 'updated_at'])
                    ->merge(['field_type' => 'text'])
                    ->toArray();
            }),
        ];

        return json_encode($struct, JSON_PRETTY_PRINT);
    }
}
