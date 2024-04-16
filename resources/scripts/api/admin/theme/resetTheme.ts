import http from '@/api/http';

export default (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/theme/reset`)
            .then(() => resolve())
            .catch(reject);
    });
};
