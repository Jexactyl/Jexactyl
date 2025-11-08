import http, { FractalResponseData, getPaginationSet, PaginatedResult } from '@/api/http';
import { useContext } from 'react';
import useSWR from 'swr';
import { createContext } from '@/api';
import { Database, rawDataToDatabase } from '@/api/routes/admin/databases/getDatabases';

export interface Node {
    id: number;
    uuid: string;
    public: boolean;
    name: string;
    description: string | null;
    databaseHostId: number | null;
    fqdn: string;
    listenPortHTTP: number;
    publicPortHTTP: number;
    listenPortSFTP: number;
    publicPortSFTP: number;
    scheme: string;
    behindProxy: boolean;
    maintenanceMode: boolean;
    memory: number;
    memoryOverallocate: number;
    disk: number;
    diskOverallocate: number;
    uploadSize: number;
    daemonBase: string;
    deployable: boolean;
    deployableFree: boolean;
    createdAt: Date;
    updatedAt: Date;

    memoryUsedPercent?: number;
    diskUsedPercent?: number;
    allocationsUsedPercent?: number;

    relations: {
        databaseHost: Database | undefined;
    };
}

export const rawDataToNode = ({ attributes, meta }: FractalResponseData): Node => ({
    id: attributes.id,
    uuid: attributes.uuid,
    public: attributes.public,
    name: attributes.name,
    description: attributes.description,
    databaseHostId: attributes.database_host_id,
    fqdn: attributes.fqdn,
    listenPortHTTP: attributes.listen_port_http,
    publicPortHTTP: attributes.public_port_http,
    listenPortSFTP: attributes.listen_port_sftp,
    publicPortSFTP: attributes.public_port_sftp,
    scheme: attributes.scheme,
    behindProxy: attributes.behind_proxy,
    maintenanceMode: attributes.maintenance_mode,
    memory: attributes.memory,
    memoryOverallocate: attributes.memory_overallocate,
    disk: attributes.disk,
    diskOverallocate: attributes.disk_overallocate,
    uploadSize: attributes.upload_size,
    daemonBase: attributes.daemon_base,
    deployable: attributes.deployable,
    deployableFree: attributes.deployable_free,
    createdAt: new Date(attributes.created_at),
    updatedAt: new Date(attributes.updated_at),

    memoryUsedPercent: meta?.utilization.memory ?? 0,
    diskUsedPercent: meta?.utilization.disk ?? 0,
    allocationsUsedPercent: meta?.utilization.allocations ?? 0,

    relations: {
        // eslint-disable-next-line camelcase
        databaseHost:
            attributes.relationships?.database_host !== undefined &&
            attributes.relationships?.database_host?.object !== 'null_resource'
                ? rawDataToDatabase(attributes.relationships.database_host as FractalResponseData)
                : undefined,
    },
});

export interface Filters {
    id?: string;
    uuid?: string;
    name?: string;
    image?: string;
    /* eslint-disable camelcase */
    external_id?: string;
    /* eslint-enable camelcase */
}

export const Context = createContext<Filters>();

export default (include: string[] = []) => {
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

    return useSWR<PaginatedResult<Node>>(['nodes', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/nodes', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(rawDataToNode),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};
