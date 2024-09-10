import http from '@/api/http';

export interface MetricData {
    nodes: number;
    servers: number;
    tickets: number;
}

export default (): Promise<MetricData> => {
    return new Promise((resolve, reject) => {
        http.get('/api/application/overview/metrics')
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
