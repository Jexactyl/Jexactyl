import http, {
    FractalPaginatedResponse,
    PaginatedResult,
    QueryBuilderParams,
    getPaginationSet,
    withQueryBuilderParams,
} from '@/api/http';
import { ApiKey, rawDataToApiKey } from '@/api/account/getApiKeys';
import { Transformers } from '@/api/definitions/admin';
import { AxiosError } from 'axios';
import { SWRConfiguration, SWRResponse } from 'swr';
import useSWR from 'swr';
import { createContext } from '@/api/admin';

const filters = ['id', 'identifier'] as const;
export type Filters = (typeof filters)[number];

export interface ContextFilters {
    id: number;
    identifier: string;
    createdAt: Date;
    lastUsedAt?: Date | null;
}

export const Context = createContext<ContextFilters>();

const getApiKeys = (): Promise<ApiKey> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/api`)
            .then(({ data }) => resolve(rawDataToApiKey(data)))
            .catch(reject);
    });
};

const useGetApiKeys = (
    params?: QueryBuilderParams<Filters>,
    config?: SWRConfiguration,
): SWRResponse<PaginatedResult<ApiKey>, AxiosError> => {
    return useSWR<PaginatedResult<ApiKey>>(
        ['/api/application/api', JSON.stringify(params)],
        async () => {
            const { data } = await http.get<FractalPaginatedResponse>('/api/application/api', {
                params: withQueryBuilderParams(params),
            });

            return {
                items: (data.data || []).map(Transformers.toApiKey),
                pagination: getPaginationSet(data.meta.pagination),
            };
        },
        config || { revalidateOnMount: true, revalidateOnFocus: false },
    );
};

export { getApiKeys, useGetApiKeys };
