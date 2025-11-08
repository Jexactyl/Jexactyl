import http from '@/api/http';
import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';
import { useParams } from 'react-router-dom';
import { Product, Transformers } from '@definitions/admin';
import { ProductFilters, ProductValues } from './types';
import { createPaginatedHook, createContext } from '@/api';

export const Context = createContext<ProductFilters>();

export const getProducts = (id: number) =>
    createPaginatedHook<Product, ProductFilters>({
        url: `/api/application/billing/categories/${id}/products`,
        swrKey: `category:${id}:products`,
        context: Context,
        transformer: Transformers.toProduct,
    })();

export const createProduct = (id: number, values: ProductValues): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories/${id}/products`, values)
            .then(({ data }) => resolve(Transformers.toProduct(data)))
            .catch(reject);
    });
};

export const getProduct = async (id: number, productId: number): Promise<Product> => {
    const { data } = await http.get(`/api/application/billing/categories/${id}/products/${productId}`);

    return Transformers.toProduct(data);
};

export const updateProduct = (id: number, productId: number, values: ProductValues): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/categories/${id}/products/${productId}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteProduct = (id: number, productId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/categories/${id}/products/${productId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

/**
 * Returns an SWR instance by automatically loading in the product for the currently
 * loaded route match in the admin area.
 */
export const useProductFromRoute = (): SWRResponse<Product, AxiosError> => {
    const params = useParams<'id' | 'productId'>();

    return useSWR(`/api/application/billing/categories/${params.id}/products/${params.productId}`, async () =>
        getProduct(Number(params.id), Number(params.productId)),
    );
};
