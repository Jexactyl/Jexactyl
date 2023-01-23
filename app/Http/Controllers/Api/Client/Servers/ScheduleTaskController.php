<?php

namespace Jexactyl\Http\Controllers\Api\Client\Servers;

use Jexactyl\Models\Task;
use Illuminate\Http\Response;
use Jexactyl\Models\Server;
use Jexactyl\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Jexactyl\Facades\Activity;
use Jexactyl\Models\Permission;
use Jexactyl\Repositories\Eloquent\TaskRepository;
use Jexactyl\Exceptions\Http\HttpForbiddenException;
use Jexactyl\Transformers\Api\Client\TaskTransformer;
use Jexactyl\Http\Requests\Api\Client\ClientApiRequest;
use Jexactyl\Http\Controllers\Api\Client\ClientApiController;
use Jexactyl\Exceptions\Service\ServiceLimitExceededException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Jexactyl\Http\Requests\Api\Client\Servers\Schedules\StoreTaskRequest;

class ScheduleTaskController extends ClientApiController
{
    /**
     * ScheduleTaskController constructor.
     */
    public function __construct(private TaskRepository $repository)
    {
        parent::__construct();
    }

    /**
     * Create a new task for a given schedule and store it in the database.
     *
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Service\ServiceLimitExceededException
     */
    public function store(StoreTaskRequest $request, Server $server, Schedule $schedule): array
    {
        $limit = config('Jexactyl.client_features.schedules.per_schedule_task_limit', 10);
        if ($schedule->tasks()->count() >= $limit) {
            throw new ServiceLimitExceededException("Schedules may not have more than $limit tasks associated with them. Creating this task would put this schedule over the limit.");
        }

        if ($server->backup_limit === 0 && $request->action === 'backup') {
            throw new HttpForbiddenException("A backup task cannot be created when the server's backup limit is set to 0.");
        }

        /** @var \Jexactyl\Models\Task|null $lastTask */
        $lastTask = $schedule->tasks()->orderByDesc('sequence_id')->first();

        /** @var \Jexactyl\Models\Task $task */
        $task = $this->repository->create([
            'schedule_id' => $schedule->id,
            'sequence_id' => ($lastTask->sequence_id ?? 0) + 1,
            'action' => $request->input('action'),
            'payload' => $request->input('payload') ?? '',
            'time_offset' => $request->input('time_offset'),
            'continue_on_failure' => (bool) $request->input('continue_on_failure'),
        ]);

        Activity::event('server:task.create')
            ->subject($schedule, $task)
            ->property(['name' => $schedule->name, 'action' => $task->action, 'payload' => $task->payload])
            ->log();

        return $this->fractal->item($task)
            ->transformWith($this->getTransformer(TaskTransformer::class))
            ->toArray();
    }

    /**
     * Updates a given task for a server.
     *
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(StoreTaskRequest $request, Server $server, Schedule $schedule, Task $task): array
    {
        if ($schedule->id !== $task->schedule_id || $server->id !== $schedule->server_id) {
            throw new NotFoundHttpException();
        }

        if ($server->backup_limit === 0 && $request->action === 'backup') {
            throw new HttpForbiddenException("A backup task cannot be created when the server's backup limit is set to 0.");
        }

        $this->repository->update($task->id, [
            'action' => $request->input('action'),
            'payload' => $request->input('payload') ?? '',
            'time_offset' => $request->input('time_offset'),
            'continue_on_failure' => (bool) $request->input('continue_on_failure'),
        ]);

        Activity::event('server:task.update')
            ->subject($schedule, $task)
            ->property(['name' => $schedule->name, 'action' => $task->action, 'payload' => $task->payload])
            ->log();

        return $this->fractal->item($task->refresh())
            ->transformWith($this->getTransformer(TaskTransformer::class))
            ->toArray();
    }

    /**
     * Delete a given task for a schedule. If there are subsequent tasks stored in the database
     * for this schedule their sequence IDs are decremented properly.
     *
     * @throws \Exception
     */
    public function delete(ClientApiRequest $request, Server $server, Schedule $schedule, Task $task): JsonResponse
    {
        if ($task->schedule_id !== $schedule->id || $schedule->server_id !== $server->id) {
            throw new NotFoundHttpException();
        }

        if (!$request->user()->can(Permission::ACTION_SCHEDULE_UPDATE, $server)) {
            throw new HttpForbiddenException('You do not have permission to perform this action.');
        }

        $schedule->tasks()->where('sequence_id', '>', $task->sequence_id)->update([
            'sequence_id' => $schedule->tasks()->getConnection()->raw('(sequence_id - 1)'),
        ]);

        $task->delete();

        Activity::event('server:task.delete')->subject($schedule, $task)->property('name', $schedule->name)->log();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
