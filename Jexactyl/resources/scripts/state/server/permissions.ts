import { getSubuserPermissions } from '@/api/routes/server/permissions';
import { action, Action, thunk, Thunk } from 'easy-peasy';

export interface PanelPermissions {
    [key: string]: {
        description: string;
        keys: { [k: string]: string };
    };
}

export interface GloablPermissionsStore {
    data: PanelPermissions;
    setPermissions: Action<GloablPermissionsStore, PanelPermissions>;
    getPermissions: Thunk<GloablPermissionsStore, void, Record<string, unknown>, any, Promise<void>>;
}

const permissions: GloablPermissionsStore = {
    data: {},

    setPermissions: action((state, payload) => {
        state.data = payload;
    }),

    getPermissions: thunk(async actions => {
        const permissions = await getSubuserPermissions();

        actions.setPermissions(permissions);
    }),
};

export default permissions;
