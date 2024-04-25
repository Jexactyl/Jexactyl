import { useContext } from 'react';
import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';
import { createContext, withRelationships } from '@/api/admin';
import { useParams } from 'react-router-dom';
import { Product, rawDataToProduct } from '@/api/admin/billing/products';
import http, { FractalResponseData, FractalResponseList, PaginatedResult, getPaginationSet } from '@/api/http';
import { Transformers } from '@/api/definitions/admin';

const filters = ['id', 'uuid', 'name', 'description'] as const;
export type Filters = (typeof filters)[number];

export interface Category {
    id: number;
    uuid: string;
    name: string;
    icon: string;
    description: string;
    visible: boolean;

    createdAt: Date;
    updatedAt?: Date | null;

    relationships: {
        products?: Product[];
    };
}

export interface ContextFilters {
    id?: number;
    name?: string;
}

export interface Values {
    name: string;
    icon: string;
    description: string;
    visible: boolean;
}

export const Context = createContext<ContextFilters>();

const rawDataToCategory = ({ attributes }: FractalResponseData): Category =>
    ({
        id: attributes.id,
        uuid: attributes.uuid,
        name: attributes.name,
        icon: attributes.icon,
        description: attributes.description,
        visible: attributes.visible,

        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),

        relationships: {
            products: ((attributes.relationships?.products as FractalResponseList | undefined)?.data || []).map(
                rawDataToProduct,
            ),
        },
    } as Category);

const useGetCategories = (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(Context);

    const params = {};
    if (filters !== null) {
        Object.keys(filters).forEach(key => {
            // @ts-expect-error todo
            params['filter[' + key + ']'] = filters[key];
        });
    }

    if (sort !== null) {
        // @ts-expect-error todo
        params.sort = (sortDirection ? '-' : '') + sort;
    }

    return useSWR<PaginatedResult<Category>>(['categories', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/billing/categories', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(rawDataToCategory),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

const getCategories = (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories`)
            .then(({ data }) => resolve((data.data || []).map(rawDataToCategory)))
            .catch(reject);
    });
};

const getCategory = async (id: number): Promise<Category> => {
    const { data } = await http.get(`/api/application/billing/categories/${id}`, {
        params: {
            include: 'products',
        },
    });

    return withRelationships(Transformers.toCategory(data), 'products');
};

const createCategory = (values: Values): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories`, values)
            .then(({ data }) => resolve(Transformers.toCategory(data)))
            .catch(reject);
    });
};

const updateCategory = (id: number, values: Values): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/categories/${id}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

const deleteCategory = (id: number): Promise<void> => {
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
const useCategoryFromRoute = (): SWRResponse<Category, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/billing/categories/${params.id}`, async () => getCategory(Number(params.id)));
};

export {
    getCategory,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    useGetCategories,
    rawDataToCategory,
    useCategoryFromRoute,
};
