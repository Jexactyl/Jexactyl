import http from '@/api/http';
import { ApiKeyPermission } from '@definitions/admin';

export interface Values {
    memo: string;
    permissions: ApiKeyPermission;
}

export default (values: Values): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/api', values)
            .then(({ data }) => {
                resolve(data.token);
            })
            .catch(reject);
    });
};
