import useSWR from 'swr';
import { createContext, useContext } from 'react';
import http, { getPaginationSet, PaginatedResult } from '@/api/http';

export interface ListContext<T> {
    page: number;
    setPage: (page: ((p: number) => number) | number) => void;

    filters: T | null;
    setFilters: (filters: ((f: T | null) => T | null) | T | null) => void;

    sort: string | null;
    setSort: (sort: string | null) => void;

    sortDirection: boolean;
    setSortDirection: (direction: ((p: boolean) => boolean) | boolean) => void;
}

export interface PaginatedRequestConfig<T, F> {
    url: string;
    swrKey: string;
    context: React.Context<ListContext<F>>;
    transformer: (data: any) => T;
    includes?: string[];
}

function create<T>() {
    return createContext<ListContext<T>>({
        page: 1,
        setPage: () => 1,

        filters: null,
        setFilters: () => null,

        sort: null,
        setSort: () => null,

        sortDirection: false,
        setSortDirection: () => false,
    });
}

export { create as createContext };

export function createPaginatedHook<T, F extends Record<string, any>>(config: PaginatedRequestConfig<T, F>) {
    return (include: string[] = config.includes || []) => {
        const { page, filters, sort, sortDirection } = useContext(config.context);

        const params: Record<string, any> = {};
        if (filters && typeof filters === 'object') {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params[`filter[${key}]`] = value;
                }
            });
        }

        if (sort !== null) {
            params.sort = (sortDirection ? '-' : '') + sort;
        }

        return useSWR<PaginatedResult<T>>([config.swrKey, page, filters, sort, sortDirection], async () => {
            const { data } = await http.get(config.url, {
                params: { include: include.join(','), page, ...params },
            });

            return {
                items: (data.data || []).map(config.transformer),
                pagination: getPaginationSet(data.meta.pagination),
            };
        });
    };
}
