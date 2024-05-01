import http from '@/api/http';

export default (id: number, nodeId: number, data: { key: string; value: string }[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/products/${id}`, { node: nodeId, data })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
