import http from '@/api/http';

export const linkDiscord = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/discord')
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

export const unlinkDiscord = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/discord/unlink')
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};
