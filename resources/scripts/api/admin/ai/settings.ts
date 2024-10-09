import http from '@/api/http';

export const updateSettings = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/ai/settings`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
