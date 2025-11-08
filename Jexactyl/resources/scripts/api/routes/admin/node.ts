import { Model, UUID, withRelationships } from '@/api/routes/admin/index';
import http, { QueryBuilderParams, withQueryBuilderParams } from '@/api/http';
import { Transformers } from '@definitions/admin';
import { Server } from '@/api/routes/admin/server';

interface NodePorts {
    http: {
        listen: number;
        public: number;
    };
    sftp: {
        listen: number;
        public: number;
    };
}

export interface Allocation extends Model {
    id: number;
    ip: string;
    port: number;
    alias: string | null;
    isAssigned: boolean;
    relationships: {
        node?: Node;
        server?: Server | null;
    };
    getDisplayText(): string;
}

export interface Node extends Model {
    id: number;
    uuid: UUID;
    isPublic: boolean;
    databaseHostId: number;
    name: string;
    description: string | null;
    fqdn: string;
    ports: NodePorts;
    scheme: 'http' | 'https';
    isBehindProxy: boolean;
    isMaintenanceMode: boolean;
    memory: number;
    memoryOverallocate: number;
    disk: number;
    diskOverallocate: number;
    uploadSize: number;
    daemonBase: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Gets a single node and returns it.
 */
export const getNode = async (id: string | number): Promise<Node> => {
    const { data } = await http.get(`/api/application/nodes/${id}`);

    return withRelationships(Transformers.toNode(data.data));
};

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
