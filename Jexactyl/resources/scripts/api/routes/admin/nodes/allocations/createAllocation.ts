import http from '@/api/http';
import { Allocation, rawDataToAllocation } from '@/api/routes/admin/nodes/getAllocations';

export interface Values {
    ip: string;
    startPort?: number | null;
    endPort?: number | null;
    alias?: string;
}

export default (id: string | number, values: Values, include: string[] = []): Promise<Allocation[]> => {
    return new Promise((resolve, reject) => {
        http.post(
            `/api/application/nodes/${id}/allocations`,
            { start_port: values.startPort, end_port: values.endPort, ...values },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve((data || []).map(rawDataToAllocation)))
            .catch(reject);
    });
};
