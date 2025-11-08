import http from '@/api/http';
import { Category, Transformers } from '@definitions/account/billing';

export const getCategories = (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/categories`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toCategory)))
            .catch(reject);
    });
};
