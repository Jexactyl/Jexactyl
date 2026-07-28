<?php

namespace Everest\Transformers\Api\Application;

use Everest\Models\User;
use Illuminate\Support\Str;
use Everest\Models\ActivityLog;
use League\Fractal\Resource\Item;
use Illuminate\Database\Eloquent\Model;
use Everest\Transformers\Api\Transformer;
use League\Fractal\Resource\NullResource;

class ActivityLogTransformer extends Transformer
{
    protected array $availableIncludes = ['actor'];

    public function getResourceName(): string
    {
        return ActivityLog::RESOURCE_NAME;
    }

    public function transform(ActivityLog $model): array
    {
        return [
            // This is not for security, it is only to provide a unique identifier to
            // the front-end for each entry to improve rendering performance since there
            // is nothing else sufficiently unique to key off at this point.
            'id' => sha1($model->id),
            'log_id' => $model->id,
            'batch' => $model->batch,
            'event' => $model->event,
            'is_api' => !is_null($model->api_key_id),
            'ip' => $model->ip,
            'description' => $model->description,
            'properties' => $this->properties($model),
            'has_additional_metadata' => $this->hasAdditionalMetadata($model),
            'subjects' => $this->subjects($model),
            'timestamp' => $model->timestamp->toIso8601String(),
        ];
    }

    /**
     * Returns a lightweight summary of the resources that this activity log entry
     * affected, so the front-end can render a paper-trail of what was touched by
     * a given action without needing to eager-load and transform every possible
     * subject type.
     *
     * The "admin" middleware defaults every request's subject to the acting admin
     * themselves unless a controller explicitly overrides it with the real target
     * (e.g. the user being suspended). That default is meaningless to display next
     * to the actor, so we filter out any subject that is actually just the actor.
     */
    protected function subjects(ActivityLog $model): array
    {
        return $model->subjects
            ->reject(function ($subject) use ($model) {
                return $subject->subject_type === $model->actor_type && $subject->subject_id === $model->actor_id;
            })
            ->map(function ($subject) {
                return [
                    'type' => $subject->subject_type,
                    'id' => $subject->subject_id,
                    'identifier' => $subject->subject ? $this->identifierFor($subject->subject) : null,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Picks the first human-readable attribute available on a subject model so we
     * can display something more useful than a bare ID in the activity log.
     */
    protected function identifierFor(Model $model): string
    {
        foreach (['name', 'username', 'identifier', 'uuid', 'title', 'code'] as $attribute) {
            if (!empty($model->{$attribute})) {
                return (string) $model->{$attribute};
            }
        }

        return '#' . $model->getKey();
    }

    public function includeActor(ActivityLog $model): Item|NullResource
    {
        if (!$model->actor instanceof User) {
            return $this->null();
        }

        return $this->item($model->actor, new UserTransformer());
    }

    /**
     * Transforms any array values in the properties into a countable field for easier
     * use within the translation outputs.
     */
    protected function properties(ActivityLog $model): object
    {
        if (!$model->properties || $model->properties->isEmpty()) {
            return (object) [];
        }

        $properties = $model->properties
            ->mapWithKeys(function ($value, $key) use ($model) {
                if ($key === 'ip' && !optional($model->actor)->is($this->request->user())) {
                    return [$key => '[hidden]'];
                }

                if (!is_array($value)) {
                    // Perform some directory normalization at this point.
                    if ($key === 'directory') {
                        $value = str_replace('//', '/', '/' . trim($value, '/') . '/');
                    }

                    return [$key => $value];
                }

                return [$key => $value, "{$key}_count" => count($value)];
            });

        $keys = $properties->keys()->filter(fn ($key) => Str::endsWith($key, '_count'))->values();
        if ($keys->containsOneItem()) {
            $properties = $properties->merge(['count' => $properties->get($keys[0])])->except($keys[0]);
        }

        return (object) $properties->toArray();
    }

    /**
     * Determines if there are any log properties that we've not already exposed
     * in the response language string and that are not just the IP address or
     * the browser useragent.
     *
     * This is used by the front-end to selectively display an "additional metadata"
     * button that is pointless if there is nothing the user can't already see from
     * the event description.
     */
    protected function hasAdditionalMetadata(ActivityLog $model): bool
    {
        if (is_null($model->properties) || $model->properties->isEmpty()) {
            return false;
        }

        $str = trans('activity.' . str_replace(':', '.', $model->event));
        preg_match_all('/:(?<key>[\w.-]+\w)(?:[^\w:]?|$)/', $str, $matches);

        $exclude = array_merge($matches['key'], ['ip', 'useragent', 'using_sftp']);
        foreach ($model->properties->keys() as $key) {
            if (!in_array($key, $exclude, true)) {
                return true;
            }
        }

        return false;
    }
}
