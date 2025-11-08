import http, { PaginatedResult, getPaginationSet } from '@/api/http';
import { type ApiKey } from '@definitions/admin';
import { Transformers } from '@definitions/admin';
import useSWR from 'swr';
import { createContext } from '@/api';
import { useContext } from 'react';

const filters = ['id', 'identifier', 'last_used_at'] as const;
export type Filters = (typeof filters)[number];

export interface ContextFilters {
    id?: number;
    identifier?: string;
    created_at?: Date;
    last_used_at?: Date | null;
}

export const Context = createContext<ContextFilters>();

const getApiKeys = (): Promise<ApiKey> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/api`)
            .then(({ data }) => resolve(Transformers.toApiKey(data)))
            .catch(reject);
    });
};

const useGetApiKeys = (include: string[] = []) => {
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

    return useSWR<PaginatedResult<ApiKey>>(['api_keys', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/api', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toApiKey),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export { getApiKeys, useGetApiKeys };
