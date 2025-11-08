import { action, Action } from 'easy-peasy';

export type AlertType = 'success' | 'warning' | 'danger' | 'info';
export type AlertPosition = 'top-center' | 'bottom-right' | 'bottom-left' | 'center';

export interface EverestSettings {
    auth: {
        registration: {
            enabled: boolean;
        };
        security: {
            force2fa: boolean;
            attempts: number;
        };
        modules: {
            jguard: {
                enabled: boolean;
                delay?: number;
            };
            discord: {
                enabled: boolean;
                clientId: boolean;
                clientSecret: boolean;
            };
            google: {
                enabled: boolean;
                clientId: boolean;
                clientSecret: boolean;
            };
            onboarding: {
                enabled: boolean;
                content?: string;
            };
        };
    };
    tickets: {
        enabled: boolean;
        maxCount: number;
    };
    billing: {
        enabled: boolean;
        paypal: boolean;
        link: boolean;
        keys: {
            publishable: boolean;
            secret: boolean;
        };
        currency: {
            symbol: string;
            code: string;
        };
        links: {
            terms: string;
            privacy: string;
        };
    };
    alert: {
        enabled: boolean;
        type: AlertType;
        position: AlertPosition;
        content: string;
        uuid: string;
    };
    ai: {
        enabled: boolean;
        key: boolean | string;
        user_access: boolean;
    };
    webhooks: {
        enabled: boolean;
        url: boolean;
    };
}

export interface EverestStore {
    data?: EverestSettings;
    setEverest: Action<EverestStore, EverestSettings>;
    updateEverest: Action<EverestStore, Partial<EverestSettings>>;
}

const everest: EverestStore = {
    data: undefined,

    setEverest: action((state, payload) => {
        state.data = payload;
    }),

    updateEverest: action((state, payload) => {
        // @ts-expect-error limitation of Typescript, can't do much about that currently unfortunately.
        state.data = { ...state.data, ...payload };
    }),
};

export default everest;
