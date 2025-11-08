import http from '@/api/http';
import { Server, ServerStats, Transformers } from '@definitions/server';
import { PowerAction } from '@server/console/ServerConsoleContainer';

export type ServerStatus =
    | 'installing'
    | 'install_failed'
    | 'reinstall_failed'
    | 'suspended'
    | 'restoring_backup'
    | null;

const getServer = (uuid: string): Promise<[Server, string[]]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}`)
            .then(({ data }) =>
                resolve([
                    Transformers.toServer(data),
                    // eslint-disable-next-line camelcase
                    data.meta?.is_server_owner ? ['*'] : data.meta?.user_permissions || [],
                ]),
            )
            .catch(reject);
    });
};

const sendPowerAction = (uuid: string, action: PowerAction): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/power`, { signal: action })
            .then(() => resolve())
            .catch(reject);
    });
};

const reinstallServer = (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/reinstall`)
            .then(() => resolve())
            .catch(reject);
    });
};

const renameServer = (uuid: string, name: string, description?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/rename`, { name, description })
            .then(() => resolve())
            .catch(reject);
    });
};

const getServerResourceUsage = (server: string): Promise<ServerStats> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${server}/resources`)
            .then(({ data: { attributes } }) =>
                resolve({
                    status: attributes.current_state,
                    isSuspended: attributes.is_suspended,
                    memoryUsageInBytes: attributes.resources.memory_bytes,
                    cpuUsagePercent: attributes.resources.cpu_absolute,
                    diskUsageInBytes: attributes.resources.disk_bytes,
                    networkRxInBytes: attributes.resources.network_rx_bytes,
                    networkTxInBytes: attributes.resources.network_tx_bytes,
                    uptime: attributes.resources.uptime,
                }),
            )
            .catch(reject);
    });
};

export { getServer, sendPowerAction, reinstallServer, renameServer, getServerResourceUsage };
