import http, { PaginatedResult, getPaginationSet } from '@/api/http';
import { type ApiKey, ApiKeyPermission, Transformers } from '@definitions/admin';
import useSWR from 'swr';
import { createContext } from '@/api';
import { useContext } from 'react';

export interface Values {
    memo: string;
    permissions: ApiKeyPermission;
}

export const createApiKey = (values: Values): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/api', values)
            .then(({ data }) => {
                resolve(data.token);
            })
            .catch(reject);
    });
};

export const deleteApiKey = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/api/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

const filters = ['id', 'identifier', 'last_used_at'] as const;
export type Filters = (typeof filters)[number];

export interface ContextFilters {
    id?: number;
    identifier?: string;
    created_at?: Date;
    last_used_at?: Date | null;
}

export const Context = createContext<ContextFilters>();

export const getApiKeys = (): Promise<ApiKey> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/api`)
            .then(({ data }) => resolve(Transformers.toApiKey(data)))
            .catch(reject);
    });
};

export const useGetApiKeys = (include: string[] = []) => {
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
