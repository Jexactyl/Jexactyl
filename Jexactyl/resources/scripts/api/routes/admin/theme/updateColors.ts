import http from '@/api/http';

export default (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/theme/colors`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
