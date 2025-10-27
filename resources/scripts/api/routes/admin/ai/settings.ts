import http from '@/api/http';

export interface AISettings {
    enabled?: boolean;
    api_key?: string;
    key?: string | boolean; // Legacy support
    endpoint?: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
    user_access?: boolean;
}

export const updateSettings = (settings: AISettings): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/ai/settings`, settings)
            .then(() => resolve())
            .catch(reject);
    });
};
