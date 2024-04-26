import http, { FractalResponseData } from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/billing/categories';
import useSWR, { SWRResponse } from 'swr';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Transformers } from '@/api/definitions/admin';

export interface Product {
    id: number;
    uuid: string;
    categoryId: number;

    name: string;
    icon?: string;
    price: number;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };

    createdAt: Date;
    updatedAt?: Date | null;

    relationships: {
        category?: Category;
    };
}

export interface Values {
    categoryId: number;

    name: string;
    icon: string | undefined;
    price: number;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };
}

export const rawDataToProduct = ({ attributes }: FractalResponseData): Product => ({
    id: attributes.id,
    uuid: attributes.uuid,
    categoryId: attributes.category_id,
    name: attributes.name,
    icon: attributes.icon,
    price: attributes.price,
    description: attributes.description,

    limits: {
        cpu: attributes.limits.cpu,
        memory: attributes.limits.memory,
        disk: attributes.limits.disk,
        backup: attributes.limits.backup,
        database: attributes.limits.database,
        allocation: attributes.limits.allocation,
    },

    createdAt: new Date(attributes.created_at),
    updatedAt: new Date(attributes.updated_at),

    relationships: {
        category:
            attributes.relationships?.category?.object === 'category'
                ? rawDataToCategory(attributes.relationships.category as FractalResponseData)
                : undefined,
    },
});

export const createProduct = (id: number, values: Values): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories/${id}/products`, values)
            .then(({ data }) => resolve(Transformers.toProduct(data)))
            .catch(reject);
    });
};

export const getProduct = async (id: number, productId: number): Promise<Product> => {
    const { data } = await http.get(`/api/application/billing/categories/${id}/products/${productId}`);

    return rawDataToProduct(data);
};

export const updateProduct = (id: number, productId: number, values: Values): Promise<void> => {
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
