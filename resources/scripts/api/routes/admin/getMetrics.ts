import http from '@/api/http';

export interface MetricData {
    nodes: number;
    servers: {
        total: number;
        suspended: number;
        installing: number;
    };
    users: {
        total: number;
        admins: number;
    };
    databases: number;
    backups: number;
    tickets: number;
    billing?: {
        revenue: number;
        orders_pending: number;
        orders_this_month: number;
        products: number;
    };
}

export default (): Promise<MetricData> => {
    return new Promise((resolve, reject) => {
        http.get('/api/application/overview/metrics')
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
