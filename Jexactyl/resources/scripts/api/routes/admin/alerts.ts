import http from '@/api/http';
import { AlertPosition, AlertType } from '@/state/everest';

export interface AlertSettings {
    enabled: boolean;
    type: AlertType;
    position: AlertPosition;
    content: string;
}

export const updateAlertSettings = async (settings: Partial<AlertSettings>): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/alerts`, settings)
            .then(({ data }) => resolve(data))
            .catch(reject);
    });
};
