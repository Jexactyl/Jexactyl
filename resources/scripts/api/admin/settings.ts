import http from '@/api/http';

export interface GeneralSettings {
    name: string;
    auto_update: boolean;
    indicators: boolean;
}

export const updateGeneralSettings = async (settings: Partial<GeneralSettings>): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/settings`, settings)
            .then(() => resolve())
            .catch(reject);
    });
};
