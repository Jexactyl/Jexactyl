import http from '@/api/http';

interface BillingSetting {
    enabled: boolean;
}

const getSettings = (): Promise<BillingSetting> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/settings`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

const updateSettings = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/billing/settings`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};

export { getSettings, updateSettings };
