import http from '@/api/http';
import type { ServerEggVariable } from '@/api/server/types';
import { rawDataToServerEggVariable } from '@/api/transformers';

export default (id: number): Promise<ServerEggVariable[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/products/${id}/variables`)
            .then(({ data }) => resolve((data.data || []).map((datum: any) => rawDataToServerEggVariable(datum))))
            .catch(reject);
    });
};
