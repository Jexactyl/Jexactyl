import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';
import { withRelationships } from '@/api/routes/admin';
import { useParams } from 'react-router-dom';
import http from '@/api/http';
import { Category, Transformers } from '@definitions/admin';
import { CategoryFilters, CategoryValues } from './types';
import { createPaginatedHook, createContext } from '@/api';

export const Context = createContext<CategoryFilters>();

export const useGetCategories = createPaginatedHook<Category, CategoryFilters>({
    url: '/api/application/billing/categories',
    swrKey: 'categories',
    context: Context,
    transformer: Transformers.toCategory,
});

export const getCategories = (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toCategory)))
            .catch(reject);
    });
};

export const getCategory = async (id: number): Promise<Category> => {
    const { data } = await http.get(`/api/application/billing/categories/${id}`, {
        params: {
            include: 'products',
        },
    });

    return withRelationships(Transformers.toCategory(data), 'products');
};

export const createCategory = (values: CategoryValues): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories`, values)
            .then(({ data }) => resolve(Transformers.toCategory(data)))
            .catch(reject);
    });
};

export const updateCategory = (id: number, values: CategoryValues): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/categories/${id}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteCategory = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/categories/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

/**
 * Returns an SWR instance by automatically loading in the category for the currently
 * loaded route match in the admin area.
 */
export const useCategoryFromRoute = (): SWRResponse<Category, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/billing/categories/${params.id}`, async () => getCategory(Number(params.id)));
};
