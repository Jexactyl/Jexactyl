import type { Action } from 'easy-peasy';
import { action } from 'easy-peasy';

interface AdminApiStore {
    selectedApiKeys: number[];

    setSelectedApiKeys: Action<AdminApiStore, number[]>;
    appendSelectedApiKey: Action<AdminApiStore, number>;
    removeSelectedApiKey: Action<AdminApiStore, number>;
}

const apiKeys: AdminApiStore = {
    selectedApiKeys: [],

    setSelectedApiKeys: action((state, payload) => {
        state.selectedApiKeys = payload;
    }),

    appendSelectedApiKey: action((state, payload) => {
        state.selectedApiKeys = state.selectedApiKeys.filter(id => id !== payload).concat(payload);
    }),

    removeSelectedApiKey: action((state, payload) => {
        state.selectedApiKeys = state.selectedApiKeys.filter(id => id !== payload);
    }),
};

export type { AdminApiStore };
export default apiKeys;
