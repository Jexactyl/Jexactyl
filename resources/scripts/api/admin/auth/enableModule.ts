import http from '@/api/http';

export default (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/auth/modules/enable`, name)
            .then(() => resolve())
            .catch(reject);
    });
};
