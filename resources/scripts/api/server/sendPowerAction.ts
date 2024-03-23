import http from '@/api/http';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';

export default (uuid: string, action: PowerAction): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/power`, { signal: action })
            .then(() => resolve())
            .catch(reject);
    });
};
