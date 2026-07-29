import useSWR, { SWRResponse } from 'swr';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import http, { getPaginationSet, PaginatedResult } from '@/api/http';
import { withRelationships, WithRelationships } from '@/api/routes/admin';
import { Server, ServerEntry, ServerPreset, Transformers } from '@definitions/admin';
import { createContext, createPaginatedHook } from '@/api';

export interface ServerPresetFilters {
    id?: number;
    name?: string;
    cpu?: number;
}

export interface ServerPresetValues {
    name: string;
    description: string;

    cpu: number;
    memory: number;
    disk: number;

    nest_id?: number | null;
    egg_id?: number | null;
}

/**
 * A standard API response with the minimum viable details for the frontend
 * to correctly render a server.
 */
type LoadedServer = WithRelationships<Server, 'allocations' | 'user' | 'node'>;

/**
 * Fetches a server from the API and ensures that the allocations, user, and
 * node data is loaded.
 */
export const getServer = async (id: number | string): Promise<LoadedServer> => {
    const { data } = await http.get(`/api/application/servers/${id}`, {
        params: {
            include: ['allocations', 'user', 'node', 'variables', 'databases', 'product'],
        },
    });

    return withRelationships(
        Transformers.toServer(data),
        'allocations',
        'user',
        'node',
        'variables',
        'databases',
        'product',
    );
};

/**
 * Returns an SWR instance by automatically loading in the server for the currently
 * loaded route match in the admin area.
 */
export const useServerFromRoute = (): SWRResponse<LoadedServer, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/servers/${params.id}`, async () => getServer(Number(params.id)), {
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });
};

export interface ServerEntryFilters {
    id?: string;
    uuid?: string;
    name?: string;
    /* eslint-disable camelcase */
    owner_id?: string;
    node_id?: string;
    external_id?: string;
    /* eslint-enable camelcase */
}

export const ServerEntriesContext = createContext<ServerEntryFilters>();

export const useServerEntries = (include: string[] = []) => {
    const { page, filters, sort, sortDirection } = useContext(ServerEntriesContext);

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

    return useSWR<PaginatedResult<ServerEntry>>(['servers', page, filters, sort, sortDirection], async () => {
        const { data } = await http.get('/api/application/servers', {
            params: { include: include.join(','), page, ...params },
        });

        return {
            items: (data.data || []).map(Transformers.toServerEntry),
            pagination: getPaginationSet(data.meta.pagination),
        };
    });
};

export interface CreateServerRequest {
    externalId: string;
    name: string;
    description: string | null;
    ownerId: number;
    nodeId: number;

    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string;
        oomKiller: boolean;
    };

    featureLimits: {
        allocations: number;
        backups: number;
        databases: number;
        subusers: number;
    };

    allocation: {
        default: number;
        additional: number[];
    };

    startup: string;
    environment: Record<string, any>;
    eggId: number;
    image: string;
    skipScripts: boolean;
    startOnCompletion: boolean;
}

export const createServerEntry = (r: CreateServerRequest, include: string[] = []): Promise<ServerEntry> => {
    return new Promise((resolve, reject) => {
        http.post(
            '/api/application/servers',
            {
                externalId: r.externalId,
                name: r.name,
                description: r.description,
                owner_id: r.ownerId,
                node_id: r.nodeId,

                limits: {
                    cpu: r.limits.cpu,
                    disk: r.limits.disk,
                    io: r.limits.io,
                    memory: r.limits.memory,
                    swap: r.limits.swap,
                    threads: r.limits.threads,
                    oom_killer: r.limits.oomKiller,
                },

                feature_limits: {
                    allocations: r.featureLimits.allocations,
                    backups: r.featureLimits.backups,
                    databases: r.featureLimits.databases,
                    subusers: r.featureLimits.subusers,
                },

                allocation: {
                    default: r.allocation.default,
                    additional: r.allocation.additional,
                },

                startup: r.startup,
                environment: r.environment,
                egg_id: r.eggId,
                image: r.image,
                skip_scripts: r.skipScripts,
                start_on_completion: r.startOnCompletion,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toServerEntry(data)))
            .catch(reject);
    });
};

export interface UpdateServerValues {
    externalId: string;
    name: string;
    ownerId: number;

    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string;
        oomKiller: boolean;
    };

    featureLimits: {
        allocations: number;
        backups: number;
        databases: number;
        subusers: number;
    };

    renewalDate?: Date | null | undefined;
    billingProductId?: number | null;

    allocationId: number;
    addAllocations: number[];
    removeAllocations: number[];
}

export const updateServerEntry = (
    id: number,
    server: Partial<UpdateServerValues>,
    include: string[] = [],
): Promise<ServerEntry> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/servers/${id}`,
            {
                external_id: server.externalId,
                name: server.name,
                owner_id: server.ownerId,

                limits: {
                    memory: server.limits?.memory,
                    swap: server.limits?.swap,
                    disk: server.limits?.disk,
                    io: server.limits?.io,
                    cpu: server.limits?.cpu,
                    threads: server.limits?.threads,
                    oom_killer: server.limits?.oomKiller,
                },

                feature_limits: {
                    allocations: server.featureLimits?.allocations,
                    backups: server.featureLimits?.backups,
                    databases: server.featureLimits?.databases,
                    subusers: server.featureLimits?.subusers,
                },

                renewal_date:
                    server.renewalDate instanceof Date ? server.renewalDate.toISOString() : server.renewalDate,
                billing_product_id: server.billingProductId,

                allocation_id: server.allocationId,
                add_allocations: server.addAllocations,
                remove_allocations: server.removeAllocations,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toServerEntry(data)))
            .catch(reject);
    });
};

export interface UpdateServerStartupValues {
    startup: string;
    environment: Record<string, any>;
    eggId: number;
    image: string;
    skipScripts: boolean;
}

export const updateServerStartupEntry = (
    id: number,
    values: Partial<UpdateServerStartupValues>,
    include: string[] = [],
): Promise<ServerEntry> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/servers/${id}/startup`,
            {
                startup: values.startup !== '' ? values.startup : null,
                environment: values.environment,
                egg_id: values.eggId,
                image: values.image,
                skip_scripts: values.skipScripts,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(Transformers.toServerEntry(data)))
            .catch(reject);
    });
};

export const deleteServerEntry = (id: number, force?: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/delete`, { force })
            .then(() => resolve())
            .catch(reject);
    });
};

export const ServerPresetsContext = createContext<ServerPresetFilters>();

export const getServerPresets = createPaginatedHook<ServerPreset, ServerPresetFilters>({
    url: '/api/application/servers/presets',
    swrKey: 'server_presets',
    context: ServerPresetsContext,
    transformer: Transformers.toServerPreset,
});

export const getServerPreset = (id: number): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/servers/presets/${id}`)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

export const createServerPreset = (values: ServerPresetValues): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/servers/presets', values)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

export const createServerFromPreset = (preset_id: number, node_id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/servers/preset', { preset_id, node_id })
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateServerPreset = (id: number, values: ServerPresetValues): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/servers/presets/${id}`, values)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

export const deleteServerPreset = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/servers/presets/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const reinstallServerEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/reinstall`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const suspendServerEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/suspend`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const toggleServerInstallStatus = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/toggle`)
            .then(() => resolve())
            .catch(reject);
    });
};

export interface TransferServerValues {
    node_id: number;
    allocation_id: number;
    additional_allocations?: number[];
}

export const transferServerEntry = (id: number, data: TransferServerValues): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/transfer`, data)
            .then(() => resolve())
            .catch(reject);
    });
};

export const unsuspendServerEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/unsuspend`)
            .then(() => resolve())
            .catch(reject);
    });
};

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

export interface BulkPowerActionResult {
    action: PowerAction;
    total: number;
    failed: { server: number; message: string }[];
}

export const bulkPowerAction = (ids: number[], action: PowerAction): Promise<BulkPowerActionResult> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/servers/bulk/power', { servers: ids, action })
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
