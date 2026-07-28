import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { Transformers, UserRole } from '@definitions/admin';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api';

export interface Filters {
    id?: string;
    name?: string;
}

export interface AdminRolePermissionFilters {
    key?: string;
}

export interface AdminRolePermissions {
    [key: string]: {
        description: string;
        keys: { [k: string]: string };
    };
}

export const Context = createContext<Filters>();

export const createRole = (
    name: string,
    description: string | null,
    color?: string | null,
    include: string[] = [],
): Promise<UserRole> => {
    return new Promise((resolve, reject) => {
        http.post(
            '/api/application/users/roles',
            {
                name,
                description,
                color,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toUserRole(data)))
            .catch(reject);
    });
};

export const deleteRole = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/users/roles/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const getRole = (id: number, include: string[] = []): Promise<UserRole> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/users/roles/${id}`, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toUserRole(data)))
            .catch(reject);
    });
};

export const getRolePermisisons = (): Promise<{
    object: string;
    attributes: {
        permissions: AdminRolePermissions;
    };
}> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/users/roles/permissions`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export const searchRoles = (filters?: { name?: string }): Promise<UserRole[]> => {
    const params = {};
    if (filters !== undefined) {
        Object.keys(filters).forEach(key => {
            // @ts-expect-error todo
            params['filter[' + key + ']'] = filters[key];
        });
    }

    return new Promise((resolve, reject) => {
        http.get('/api/application/users/roles', { params })
            .then(response => resolve((response.data.data || []).map(Transformers.toUserRole)))
            .catch(reject);
    });
};

export const updateRole = (
    id: number,
    name?: string,
    description?: string | null,
    color?: string | null,
    permissions?: string[],
    include: string[] = [],
): Promise<UserRole> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/users/roles/${id}`,
            {
                name,
                description,
                permissions,
                color,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toUserRole(data)))
            .catch(reject);
    });
};

export const getRoles = (include: string[] = []) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR<PaginatedResult<UserRole>>(['roles', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/users/roles', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toUserRole),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};
