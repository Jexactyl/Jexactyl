import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api';
import { DatabaseEntry, Transformers } from '@definitions/admin';

export interface DatabaseEntryFilters {
    id?: string;
    name?: string;
    host?: string;
}

export const DatabaseEntriesContext = createContext<DatabaseEntryFilters>();

export const useDatabaseEntries = (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(DatabaseEntriesContext);

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

    return useSWR<PaginatedResult<DatabaseEntry>>(['databases', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/databases', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toDatabaseEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export const getDatabaseEntry = (id: number, include: string[] = []): Promise<DatabaseEntry> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/databases/${id}`, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toDatabaseEntry(data)))
            .catch(reject);
    });
};

export const createDatabaseEntry = (
    name: string,
    host: string,
    port: number,
    username: string,
    password: string,
    include: string[] = [],
): Promise<DatabaseEntry> => {
    return new Promise((resolve, reject) => {
        http.post(
            '/api/application/databases',
            {
                name,
                host,
                port,
                username,
                password,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toDatabaseEntry(data)))
            .catch(reject);
    });
};

export const updateDatabaseEntry = (
    id: number,
    name: string,
    host: string,
    port: number,
    username: string,
    password: string | undefined,
    include: string[] = [],
): Promise<DatabaseEntry> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/databases/${id}`,
            {
                name,
                host,
                port,
                username,
                password,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toDatabaseEntry(data)))
            .catch(reject);
    });
};

export const deleteDatabaseEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/databases/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const searchDatabaseEntries = (filters?: DatabaseEntryFilters): Promise<DatabaseEntry[]> => {
    const params = {};
    if (filters !== undefined) {
        Object.keys(filters).forEach(key => {
            // @ts-expect-error todo
            params['filter[' + key + ']'] = filters[key];
        });
    }

    return new Promise((resolve, reject) => {
        http.get('/api/application/databases', { params })
            .then(response => resolve((response.data.data || []).map(Transformers.toDatabaseEntry)))
            .catch(reject);
    });
};
