import http from '@/api/http';

export default (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/plans/${id}/cancel`)
            .then(() => resolve())
            .catch(reject);
    });
};
