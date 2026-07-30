import useSWR from 'swr';
import { useContext } from 'react';
import http, { getPaginationSet, PaginatedResult, QueryBuilderParams, withQueryBuilderParams } from '@/api/http';
import { Allocation, AllocationEntry, Node, NodeEntry, Transformers } from '@definitions/admin';
import { createContext } from '@/api';

export const searchNodes = async (params: QueryBuilderParams<'name' | 'fqdn'>): Promise<Node[]> => {
    const { data } = await http.get('/api/application/nodes', {
        params: withQueryBuilderParams(params),
    });

    return data.data.map(Transformers.toNode);
};

export const getAllocations = async (
    id: string | number,
    perPage?: number,
    params?: QueryBuilderParams<'ip' | 'server_id'>,
): Promise<Allocation[]> => {
    const queryParams = {
        ...withQueryBuilderParams(params),
        ...(perPage ? { per_page: perPage } : {}),
    };

    const { data } = await http.get(`/api/application/nodes/${id}/allocations`, {
        params: queryParams,
    });

    return data.data.map(Transformers.toAllocation);
};

/**
 * Gets a single node from the node management list/detail endpoints and returns it.
 */
export const getNodeEntry = (id: number, include: string[] = []): Promise<NodeEntry> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}`, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toNodeEntry(data)))
            .catch(reject);
    });
};

export interface NodeEntryFilters {
    id?: string;
    uuid?: string;
    name?: string;
    image?: string;
    /* eslint-disable camelcase */
    external_id?: string;
    /* eslint-enable camelcase */
}

export const NodeEntriesContext = createContext<NodeEntryFilters>();

export const useNodeEntries = (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(NodeEntriesContext);

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

    return useSWR<PaginatedResult<NodeEntry>>(['nodes', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/nodes', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toNodeEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export interface CreateNodeValues {
    name: string;
    locationId: number;
    databaseHostId: number | null;
    fqdn: string;
    sftpAlias: string | null;
    scheme: string;
    behindProxy: boolean;
    public: boolean;
    daemonBase: string;
    deployable: boolean;
    deployableFree: boolean;

    memory: number;
    memoryOverallocate: number;
    disk: number;
    diskOverallocate: number;

    listenPortHTTP: number;
    publicPortHTTP: number;
    listenPortSFTP: number;
    publicPortSFTP: number;
}

export const createNodeEntry = (values: CreateNodeValues, include: string[] = []): Promise<NodeEntry> => {
    const data = {};

    Object.keys(values).forEach(key => {
        const key2 = key
            .replace('HTTP', 'Http')
            .replace('SFTP', 'Sftp')
            .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        // @ts-expect-error todo
        data[key2] = values[key];
    });

    return new Promise((resolve, reject) => {
        http.post('/api/application/nodes', data, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toNodeEntry(data)))
            .catch(reject);
    });
};

export const updateNodeEntry = (id: number, node: Partial<NodeEntry>, include: string[] = []): Promise<NodeEntry> => {
    const data = {};

    Object.keys(node).forEach(key => {
        const key2 = key
            .replace('HTTP', 'Http')
            .replace('SFTP', 'Sftp')
            .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        // @ts-expect-error todo
        data[key2] = node[key];
    });

    return new Promise((resolve, reject) => {
        http.patch(`/api/application/nodes/${id}`, data, { params: { include: include.join(',') } })
            .then(({ data }) => resolve(Transformers.toNodeEntry(data)))
            .catch(reject);
    });
};

export const deleteNodeEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/nodes/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const getNodeConfiguration = (id: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}/configuration?format=yaml`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export interface NodeInformation {
    version: string;
    system: {
        type: string;
        arch: string;
        release: string;
        cpus: number;
        supercharged: boolean;
    };
}

export const getNodeInformation = (id: number): Promise<NodeInformation> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}/information`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export interface NodeUtilization {
    cpu: number;
    memory: {
        total: number;
        used: number;
    };
    swap: {
        total: number;
        used: number;
    };
    disk: {
        total: number;
        used: number;
    };
}

export const getNodeUtilization = (id: number): Promise<NodeUtilization> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}/utilization`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};

export interface NodeAllocationFilters {
    search?: string;
    /* eslint-disable camelcase */
    server_id?: string;
    /* eslint-enable camelcase */
}

export const getNodeAllocationEntries = (
    id: string | number,
    filters: NodeAllocationFilters = {},
    include: string[] = [],
): Promise<AllocationEntry[]> => {
    const params = {};
    if (filters !== null) {
        Object.keys(filters).forEach(key => {
            // @ts-expect-error todo
            params['filter[' + key + ']'] = filters[key];
        });
    }

    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}/allocations`, { params: { include: include.join(','), ...params } })
            .then(({ data }) => resolve((data.data || []).map(Transformers.toAllocationEntry)))
            .catch(reject);
    });
};

export interface CreateNodeAllocationValues {
    ip: string;
    startPort?: number | null;
    endPort?: number | null;
    alias?: string;
}

export const createNodeAllocationEntry = (
    id: string | number,
    values: CreateNodeAllocationValues,
    include: string[] = [],
): Promise<AllocationEntry[]> => {
    return new Promise((resolve, reject) => {
        http.post(
            `/api/application/nodes/${id}/allocations`,
            { start_port: values.startPort, end_port: values.endPort, ...values },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve((data || []).map(Transformers.toAllocationEntry)))
            .catch(reject);
    });
};

export const deleteNodeAllocationEntry = (nodeId: number, allocationId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/nodes/${nodeId}/allocations/${allocationId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteAllNodeAllocationEntries = (nodeId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/nodes/${nodeId}/allocations`)
            .then(() => resolve())
            .catch(reject);
    });
};

export interface NodeAllocationEntryFilters {
    id?: string;
    ip?: string;
    port?: string;
}

export const NodeAllocationEntriesContext = createContext<NodeAllocationEntryFilters>();

export const useNodeAllocationEntries = (id: number, include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(NodeAllocationEntriesContext);

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

    return useSWR<PaginatedResult<AllocationEntry>>(['allocations', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get(`/api/application/nodes/${id}/allocations`, {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toAllocationEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};
