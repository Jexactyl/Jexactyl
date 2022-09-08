import http, { FractalResponseData } from '@/api/http';

export interface Resources {
    balance: number;
    cpu: number;
    memory: number;
    disk: number;
    slots: number;
    backups: number;
    databases: number;
    allocations: number;
}

export const rawDataToResources = ({ attributes: data }: FractalResponseData): Resources => ({
    balance: data.balance,
    cpu: data.cpu,
    memory: data.memory,
    disk: data.disk,
    slots: data.slots,
    backups: data.backups,
    databases: data.databases,
    allocations: data.allocations
});

export const getResources = async (): Promise<Resources> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/store')
            .then(({ data }) => resolve(rawDataToResources(data)))
            .catch(reject);
    });
};
