import http, { getPaginationSet, PaginatedResult, QueryBuilderParams, withQueryBuilderParams } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api';
import { EggEntry, Nest, NestEntry, Transformers } from '@definitions/admin';

export const searchNests = async (params: QueryBuilderParams<'name'>): Promise<Nest[]> => {
    const { data } = await http.get('/api/application/nests', {
        params: withQueryBuilderParams(params),
    });

    return data.data.map(Transformers.toNest);
};

export const getNestEntry = (id: number, include: string[]): Promise<NestEntry> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nests/${id}`, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toNestEntry(data)))
            .catch(reject);
    });
};

export interface NestEntryFilters {
    id?: string;
    name?: string;
}

export const NestEntriesContext = createContext<NestEntryFilters>();

export const useNestEntries = (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(NestEntriesContext);

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

    return useSWR<PaginatedResult<NestEntry>>(['nests', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/nests', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toNestEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export const NestEggEntriesContext = createContext<NestEntryFilters>();

export const useNestEggEntries = (nestId: number, include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(NestEggEntriesContext);

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

    return useSWR<PaginatedResult<EggEntry>>([nestId, 'eggs', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get(`/api/application/nests/${nestId}/eggs`, {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toEggEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export const createNestEntry = (
    name: string,
    description: string | null,
    author: string,
    include: string[] = [],
): Promise<NestEntry> => {
    return new Promise((resolve, reject) => {
        http.post(
            '/api/application/nests',
            {
                name,
                description,
                author,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toNestEntry(data)))
            .catch(reject);
    });
};

export const updateNestEntry = (
    id: number,
    name: string,
    description: string | null,
    author: string,
    include: string[] = [],
): Promise<NestEntry> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/nests/${id}`,
            {
                name,
                description,
                author,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toNestEntry(data)))
            .catch(reject);
    });
};

export const deleteNestEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/nests/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const importEggEntry = (
    id: number,
    content: any,
    type = 'application/json',
    include: string[] = [],
): Promise<EggEntry> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/nests/${id}/import`, content, {
            headers: {
                'Content-Type': type,
            },
            params: {
                include: include.join(','),
            },
        })
            .then(({ data }) => resolve(Transformers.toEggEntry(data)))
            .catch(reject);
    });
};
