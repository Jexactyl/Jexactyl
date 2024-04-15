import { action, Action } from 'easy-peasy';

export interface SiteTheme {
    colors: {
        primary: string;
        secondary: string;

        background: string;
        headers: string;
        sidebar: string;
    };
}

export interface ThemeStore {
    data?: SiteTheme;
    setTheme: Action<ThemeStore, SiteTheme>;
}

const theme: ThemeStore = {
    data: undefined,

    setTheme: action((state, payload) => {
        state.data = payload;
    }),
};

export default theme;
