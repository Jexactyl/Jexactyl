import { PanelPermissions } from '@/state/server/permissions';
import http from '@/api/http';

export const getSubuserPermissions = (): Promise<PanelPermissions> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/permissions')
            .then(({ data }) => resolve(data.attributes.permissions))
            .catch(reject);
    });
};
