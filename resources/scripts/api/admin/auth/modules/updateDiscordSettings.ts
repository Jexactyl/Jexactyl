import http from '@/api/http';

export default (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/auth/modules/discord`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
