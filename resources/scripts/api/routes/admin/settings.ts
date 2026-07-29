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
        };
    };
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

export interface LogFile {
    name: string;
    size: number;
    modifiedAt: Date;
    errors: number;
    warnings: number;
}

export const getLogFiles = async (): Promise<LogFile[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/settings/debug`)
            .then(({ data }) =>
                resolve(
                    (data.data || []).map(
                        (entry: any): LogFile => ({
                            name: entry.attributes.name,
                            size: entry.attributes.size,
                            modifiedAt: new Date(entry.attributes.modified_at),
                            errors: entry.attributes.errors,
                            warnings: entry.attributes.warnings,
                        }),
                    ),
                ),
            )
            .catch(reject);
    });
};

const downloadBlob = (data: BlobPart, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(url);
};

export const downloadLogFile = async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/settings/debug/${name}`, { responseType: 'blob' })
            .then(({ data }) => {
                downloadBlob(data, name);
                resolve();
            })
            .catch(reject);
    });
};

export const downloadLogArchive = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/settings/debug/archive`, { responseType: 'blob' })
            .then(({ data }) => {
                downloadBlob(data, `panel-logs-${new Date().toISOString().slice(0, 10)}.zip`);
                resolve();
            })
            .catch(reject);
    });
};
