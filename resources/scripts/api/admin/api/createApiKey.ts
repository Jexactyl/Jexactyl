import http from '@/api/http';
import { ApiKey, rawDataToApiKey } from '@/api/account/getApiKeys';

export interface Values {
    memo: string;
    permissions: Permission;
}

export interface Permission {
    r_allocations: string;
    r_database_hosts: string;
    r_eggs: string;
    r_locations: string;
    r_nests: string;
    r_nodes: string;
    r_server_databases: string;
    r_servers: string;
    r_users: string;
}

export default (values: Values): Promise<ApiKey> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/api', values)
            .then(({ data }) => resolve(rawDataToApiKey(data)))
            .catch(reject);
    });
};
