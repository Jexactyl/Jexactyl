import http from '@/api/http';

export const resetTheme = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/theme/reset`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateColors = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/theme/colors`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
