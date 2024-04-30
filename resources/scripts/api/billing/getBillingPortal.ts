import http from '@/api/http';

export default (): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/portal`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
