import http from '@/api/http';

export const handleQuery = (server: string, query: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${server}/ai`, { query })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
