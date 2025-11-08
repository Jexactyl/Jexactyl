import http from '@/api/http';
import { Task, Transformers } from '@definitions/server';

const modifyTask = async (
    uuid: string,
    schedule: number,
    task: number | undefined,
    data: { action: string; payload: string; timeOffset: string | number; continueOnFailure: boolean },
): Promise<Task> => {
    const { data: response } = await http.post(
        `/api/client/servers/${uuid}/schedules/${schedule}/tasks${task ? `/${task}` : ''}`,
        {
            action: data.action,
            payload: data.payload,
            continue_on_failure: data.continueOnFailure,
            time_offset: data.timeOffset,
        },
    );

    return Transformers.toTask(response);
};

const deleteTask = (uuid: string, scheduleId: number, taskId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/schedules/${scheduleId}/tasks/${taskId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { modifyTask, deleteTask };
