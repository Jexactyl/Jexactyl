import http from '@/api/http';

export default (code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/coupon', { code: code })
            .then(() => resolve())
            .catch(reject);
    });
};
