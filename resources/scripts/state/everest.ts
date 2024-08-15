import { action, Action } from 'easy-peasy';

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
    };
}

export interface EverestStore {
    data?: EverestSettings;
    setEverest: Action<EverestStore, EverestSettings>;
}

const everest: EverestStore = {
    data: undefined,

    setEverest: action((state, payload) => {
        state.data = payload;
    }),
};

export default everest;
