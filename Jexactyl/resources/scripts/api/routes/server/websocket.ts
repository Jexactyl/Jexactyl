import http from '@/api/http';

export default (server: string): Promise<{ token: string; socket: string }> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${server}/websocket`)
            .then(({ data }) =>
                resolve({
                    token: data.data.token,
                    socket: data.data.socket,
                }),
            )
            .catch(reject);
    });
};
