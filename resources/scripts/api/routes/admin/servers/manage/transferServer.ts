import http from '@/api/http';

export interface TransferServerData {
    node_id: number;
    allocation_id: number;
    additional_allocations?: number[];
}

export default (id: number, data: TransferServerData): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/servers/${id}/transfer`, data)
            .then(() => resolve())
            .catch(reject);
    });
};
