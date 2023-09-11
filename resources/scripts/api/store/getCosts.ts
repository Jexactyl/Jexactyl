import http, { FractalResponseData } from '@/api/http';

export interface Costs {
    cpu: number;
    memory: number;
    disk: number;
    slots: number;
    ports: number;
    backups: number;
    databases: number;
}

export const rawDataToCosts = ({ attributes: data }: FractalResponseData): Costs => ({
    cpu: data.cpu,
    memory: data.memory,
    disk: data.disk,
    slots: data.slots,
    ports: data.ports,
    backups: data.backups,
    databases: data.databases,
});

export const getCosts = async (): Promise<Costs> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/store/costs')
            .then(({ data }) => resolve(rawDataToCosts(data)))
            .catch(reject);
    });
};
