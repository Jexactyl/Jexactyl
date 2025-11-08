import http from '@/api/http';
import { ApiKey, Transformers } from '@definitions/account';

const getApiKeys = (): Promise<ApiKey[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/api-keys')
            .then(({ data }) => resolve((data.data || []).map(Transformers.toApiKey)))
            .catch(reject);
    });
};

const createApiKey = (description: string, allowedIps: string): Promise<ApiKey & { secretToken: string }> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/api-keys', {
            description,
            allowed_ips: allowedIps.length > 0 ? allowedIps.split('\n') : [],
        })
            .then(({ data }) =>
                resolve({
                    ...Transformers.toApiKey(data),
                    // eslint-disable-next-line camelcase
                    secretToken: data.meta?.secret_token ?? '',
                }),
            )
            .catch(reject);
    });
};

const deleteApiKey = (identifier: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/account/api-keys/${identifier}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { getApiKeys, createApiKey, deleteApiKey };
