import http from '@/api/http';
import { ApiKey, rawDataToApiKey } from '@/api/account/getApiKeys';

export interface Values {
    memo: string;
    permissions: Permission;
}

export interface Permission {
    r_allocations: number;
    r_database_hosts: number;
    r_eggs: number;
    r_locations: number;
    r_nests: number;
    r_nodes: number;
    r_server_databases: number;
    r_servers: number;
    r_users: number;
}

export default (values: Values): Promise<ApiKey> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/api', values)
            .then(({ data }) => resolve(rawDataToApiKey(data)))
            .catch(reject);
    });
};
