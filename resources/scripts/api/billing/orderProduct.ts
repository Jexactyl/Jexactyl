import http from '@/api/http';

export default (id: number, nodeId: number, data: { key: string; value: string }[]): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/products/${id}`, { data, node: nodeId })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
