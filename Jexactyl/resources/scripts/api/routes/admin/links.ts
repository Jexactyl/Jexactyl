import http, { FractalResponseData, getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api';

export interface CustomLink {
    id: number;
    name: string;
    url: string;
    visible: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface Values {
    url?: string;
    name?: string;
    visible?: boolean;
}

export const Context = createContext<Values>();

export const rawDataToLink = ({ attributes: data }: FractalResponseData): CustomLink => ({
    id: data.id,
    name: data.name,
    url: data.url,
    visible: data.visible,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
});

export const getLinks = (include: string[] = []) => {
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

    return useSWR<PaginatedResult<CustomLink>>(['links', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/links', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(rawDataToLink),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export const createLink = (values: Values): Promise<CustomLink> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/links', values)
            .then(({ data }) => resolve(rawDataToLink(data)))
            .catch(reject);
    });
};

export const updateLink = (id: number, values: Values): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/links/${id}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteLink = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/links/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};
