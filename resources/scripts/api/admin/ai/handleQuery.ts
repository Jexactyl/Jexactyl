import http from '@/api/http';

export const handleQuery = (query: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/ai/query`, { query })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
