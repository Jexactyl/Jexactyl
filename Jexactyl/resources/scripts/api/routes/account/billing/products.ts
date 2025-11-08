import { Product, Transformers, type Node } from '@definitions/account/billing';
import { EggVariable } from '@definitions/server';
import http from '@/api/http';
import { Transformers as ServerTransformers } from '@definitions/server';

export const getProducts = (id: number): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/categories/${id}`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toProduct)))
            .catch(reject);
    });
};

export const getProduct = (id: number): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/products/${id}`)
            .then(({ data }) => resolve(Transformers.toProduct(data)))
            .catch(reject);
    });
};

export const getProductVariables = (id: number): Promise<EggVariable[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/products/${id}/variables`)
            .then(({ data }) => resolve((data.data || []).map(ServerTransformers.toEggVariable)))
            .catch(reject);
    });
};

export const getViableNodes = (productId: number): Promise<Node[]> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/nodes/${productId}`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toNode)))
            .catch(reject);
    });
};
