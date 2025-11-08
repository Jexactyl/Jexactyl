import http from '@/api/http';

export const toggleModule = (toggle: string, name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/auth/modules/${toggle}`, name)
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateModule = (module: string, key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/auth/modules`, { module, key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
