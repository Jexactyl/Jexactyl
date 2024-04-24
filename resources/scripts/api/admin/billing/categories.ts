import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Transformers } from '@/api/definitions/admin';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import http, {
    FractalPaginatedResponse,
    FractalResponseData,
    PaginatedResult,
    QueryBuilderParams,
    getPaginationSet,
    withQueryBuilderParams,
} from '@/api/http';
import { createContext } from '@/api/admin';

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
}

export interface ContextFilters {
    id: number;
    uuid: string;
    title: string;
    createdAt: Date;
    updatedAt?: Date | null;
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
    } as Category);

const useGetCategories = (
    params?: QueryBuilderParams<Filters>,
    config?: SWRConfiguration,
): SWRResponse<PaginatedResult<Category>, AxiosError> => {
    return useSWR<PaginatedResult<Category>>(
        ['/api/application/billing/categories', JSON.stringify(params)],
        async () => {
            const { data } = await http.get<FractalPaginatedResponse>('/api/application/billing/categories', {
                params: withQueryBuilderParams(params),
            });

            return {
                items: (data.data || []).map(Transformers.toCategory),
                pagination: getPaginationSet(data.meta.pagination),
            };
        },
        config || { revalidateOnMount: true, revalidateOnFocus: false },
    );
};

const getCategories = (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories`)
            .then(({ data }) => resolve((data.data || []).map(rawDataToCategory)))
            .catch(reject);
    });
};

const getCategory = (id: number): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories/${id}`)
            .then(({ data }) => resolve(rawDataToCategory(data)))
            .catch(reject);
    });
};

/**
 * Returns an SWR instance by automatically loading in the category for the currently
 * loaded route match in the admin area.
 */
const useCategoryFromRoute = (): SWRResponse<Category, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/billing/categories/${params.id}`, async () => getCategory(Number(params.id)), {
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });
};

export { getCategory, getCategories, useGetCategories, useCategoryFromRoute };
