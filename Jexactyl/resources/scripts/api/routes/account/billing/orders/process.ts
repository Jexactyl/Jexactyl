import { Server } from '@definitions/server';
import http from '@/api/http';

export const processPaidOrder = (intent: string, renewal?: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/process`, { intent, renewal })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const processUnpaidOrder = (
    product: number,
    node?: number,
    renewal?: boolean,
    variables?: { key: string; value: string }[],
    server_id?: number,
): Promise<Server> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/process/free`, { server_id, node, product, renewal, variables })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
