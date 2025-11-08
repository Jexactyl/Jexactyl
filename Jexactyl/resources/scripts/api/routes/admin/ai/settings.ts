import http from '@/api/http';

export interface AISettings {
    key?: string | boolean;
    enabled?: boolean;
    user_access?: boolean;
}

export const updateSettings = (settings: AISettings): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/ai/settings`, settings)
            .then(() => resolve())
            .catch(reject);
    });
};
