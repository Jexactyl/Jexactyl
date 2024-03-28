import { createStore } from 'easy-peasy';
import flashes, { FlashStore } from '@/state/flashes';
import user, { UserStore } from '@/state/user';
import permissions, { GloablPermissionsStore } from '@/state/permissions';
import settings, { SettingsStore } from '@/state/settings';
import progress, { ProgressStore } from '@/state/progress';
import everest, { EverestStore } from '@/state/everest';

export interface ApplicationStore {
    permissions: GloablPermissionsStore;
    flashes: FlashStore;
    user: UserStore;
    settings: SettingsStore;
    progress: ProgressStore;
    everest: EverestStore;
}

const state: ApplicationStore = {
    permissions,
    flashes,
    user,
    settings,
    progress,
    everest,
};

export const store = createStore(state);
