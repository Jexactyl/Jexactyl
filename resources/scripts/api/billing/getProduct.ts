import http from '@/api/http';
import { Product, rawDataToProduct } from '@/api/billing/getProducts';

export default (id: number): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/products/${id}`)
            .then(({ data }) => resolve(rawDataToProduct(data)))
            .catch(reject);
    });
};
