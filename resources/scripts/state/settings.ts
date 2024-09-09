import { action, Action } from 'easy-peasy';

export interface SiteSettings {
    name: string;
    locale: string;
    auto_update: boolean;
    recaptcha: {
        enabled: boolean;
        siteKey: string;
    };
}

export interface SettingsStore {
    data?: SiteSettings;
    setSettings: Action<SettingsStore, SiteSettings>;
    updateSettings: Action<SettingsStore, Partial<SiteSettings>>;
}

const settings: SettingsStore = {
    data: undefined,

    setSettings: action((state, payload) => {
        state.data = payload;
    }),

    updateSettings: action((state, payload) => {
        // @ts-expect-error limitation of Typescript, can't do much about that currently unfortunately.
        state.data = { ...state.data, ...payload };
    }),
};

export default settings;
