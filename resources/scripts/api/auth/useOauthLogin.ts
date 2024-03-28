import http from '@/api/http';

export default (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get('/sanctum/csrf-cookie')
            .then(() => http.post(`/auth/modules/${name}`))
            .then(({ data }) => resolve(data || []))
            .catch(reject);
    });
};
