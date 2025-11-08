import http from '@/api/http';

export interface ExistingData {
    nodes: number;
    eggs: number;
    users: number;
    servers: number;
}

export const getExistingData = (): Promise<ExistingData> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/setup/data`)
            .then(({ data }) => {
                resolve(data);
            })
            .catch(reject);
    });
};

export const finishSetup = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/setup/finish`)
            .then(() => resolve())
            .catch(reject);
    });
};
