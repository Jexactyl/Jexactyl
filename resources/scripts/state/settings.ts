import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    logo: string;
    locale: string;

    approvals: boolean;
    tickets: boolean;
    coupons: boolean;
    databases: boolean;

    alert: {
        type: 'success' | 'info' | 'warning' | 'danger';
        message: string;
    };

    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };

    registration: {
        email: boolean;
        discord: boolean;
    };
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),
};

export default settings;
