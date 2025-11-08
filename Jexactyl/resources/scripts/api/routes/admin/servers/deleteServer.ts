import http from '@/api/http';

export default (id: number, force?: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/delete`, { force })
            .then(() => resolve())
            .catch(reject);
    });
};
