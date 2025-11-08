<?php

namespace Everest\Transformers\Api\Client;

use Everest\Models\Backup;
use Everest\Transformers\Api\Transformer;

class BackupTransformer extends Transformer
{
    public function getResourceName(): string
    {
        return Backup::RESOURCE_NAME;
    }

    public function transform(Backup $model): array
    {
        return [
            'uuid' => $model->uuid,
            'is_successful' => $model->is_successful,
            'is_locked' => $model->is_locked,
            'name' => $model->name,
            'ignored_files' => $model->ignored_files,
            'checksum' => $model->checksum,
            'bytes' => $model->bytes,
            'created_at' => $model->created_at->toIso8601String(),
            'completed_at' => $model->completed_at,
        ];
    }
}
