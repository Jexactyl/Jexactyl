import http from '@/api/http';

export interface NodeUtilization {
    cpu: number;
    memory: {
        total: number;
        used: number;
    };
    swap: {
        total: number;
        used: number;
    };
    disk: {
        total: number;
        used: number;
    };
}

export default (id: number): Promise<NodeUtilization> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/nodes/${id}/utilization`)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
