import http from '@/api/http';

export interface Values {
    username: string;
    password: string;
}

export default (values: Values): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/setup', values)
            .then(() => resolve())
            .catch(reject);
    });
};
