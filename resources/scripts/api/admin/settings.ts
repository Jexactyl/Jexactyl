import http from '@/api/http';

export interface GeneralSettings {
    appName: string;
}

export const updateGeneralSettings = async (settings: Partial<GeneralSettings>): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/settings`, settings)
            .then(() => resolve())
            .catch(reject);
    });
};
