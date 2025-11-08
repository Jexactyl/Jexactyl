import http from '@/api/http';
import { PanelMode } from '@/state/settings';

export interface GeneralSettings {
    name: string;
    logo: URL | null;
    auto_update: boolean;
    indicators: boolean;
    speed_dial: boolean;
    activity: {
        enabled: {
            account: boolean;
            server: boolean;
            admin: boolean;
        }
    }
}

export const updateGeneralSettings = async (settings: Partial<GeneralSettings>): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/settings`, {
            'app:name': settings.name,
            'app:logo': settings.logo,
            'app:auto_update': settings.auto_update,
            'app:indicators': settings.indicators,
            'app:speed_dial': settings.speed_dial,

            'activity:enabled:account': settings.activity?.enabled.account,
            'activity:enabled:server': settings.activity?.enabled.server,
            'activity:enabled:admin': settings.activity?.enabled.admin,
        })
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateModeSettings = async (mode: PanelMode): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/settings/mode`, mode)
            .then(() => resolve())
            .catch(reject);
    });
};
