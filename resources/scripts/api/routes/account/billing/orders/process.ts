import { Server } from '@definitions/server';
import http from '@/api/http';
import { BillingServerVariables } from '@/components/account/billing/order/PaymentButton';
import { Transformers } from '@/api/definitions/server';

export const createCheckoutSession = (
    product_id: number,
    node_id?: number,
    server_id?: number,
    variables?: BillingServerVariables[],
    discount_code?: string,
    egg_id?: number,
    is_business?: boolean,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/stripe/create`, {
            node_id,
            server_id,
            product_id,
            variables,
            discount_code,
            egg_id,
            is_business,   // new
        })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const processCheckoutSession = (session: string): Promise<Server> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/stripe/process`, { session })
            .then(({ data }) => resolve(Transformers.toServer(data)))
            .catch(reject);
    });
};

export const processFreeCheckoutSession = (
    product_id: number,
    node_id?: number,
    variables?: { key: string; value: string }[],
    server_id?: number,
    egg_id?: number,
): Promise<Server> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/free/process`, { server_id, node_id, product_id, variables, egg_id })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
