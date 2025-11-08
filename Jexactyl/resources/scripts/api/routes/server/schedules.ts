import http from '@/api/http';
import { Schedule, Transformers } from '@definitions/server';

type Data = Pick<Schedule, 'cron' | 'name' | 'onlyWhenOnline' | 'isActive'> & { id?: number };

const getSchedules = async (uuid: string): Promise<Schedule[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/schedules`, {
        params: {
            include: ['tasks'],
        },
    });

    console.log(data.data);

    return (data.data || []).map(Transformers.toSchedule);
};

const modifySchedule = async (uuid: string, schedule: Data): Promise<Schedule> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/schedules${schedule.id ? `/${schedule.id}` : ''}`, {
        is_active: schedule.isActive,
        only_when_online: schedule.onlyWhenOnline,
        name: schedule.name,
        minute: schedule.cron.minute,
        hour: schedule.cron.hour,
        day_of_month: schedule.cron.dayOfMonth,
        month: schedule.cron.month,
        day_of_week: schedule.cron.dayOfWeek,
    });

    return Transformers.toSchedule(data);
};

const getSchedule = (uuid: string, schedule: number): Promise<Schedule> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/schedules/${schedule}`, {
            params: {
                include: ['tasks'],
            },
        })
            .then(({ data }) => resolve(Transformers.toSchedule(data)))
            .catch(reject);
    });
};

const triggerSchedule = async (server: string, schedule: number): Promise<void> =>
    await http.post(`/api/client/servers/${server}/schedules/${schedule}/execute`);

const deleteSchedule = (uuid: string, schedule: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/schedules/${schedule}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { getSchedules, modifySchedule, getSchedule, triggerSchedule, deleteSchedule };
