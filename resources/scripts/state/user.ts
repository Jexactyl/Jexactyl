import {
    updateAccountEmail,
    updateAccountAvatarUrl,
    uploadAccountAvatar,
    removeAccountAvatar,
} from '@/api/routes/account';
import { Action, action, Thunk, thunk } from 'easy-peasy';

export interface UserData {
    uuid: string;
    username: string;
    email: string;
    language: string;
    rootAdmin: boolean;
    useTotp: boolean;
    avatarURL: string | null;
    roleName: string;
    admin_role_id?: number;
    adminPermissions: string[];
    state: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserStore {
    data?: UserData;
    setUserData: Action<UserStore, UserData>;
    updateUserData: Action<UserStore, Partial<UserData>>;
    updateUserEmail: Thunk<UserStore, { email: string; password: string }, any, UserStore, Promise<void>>;
    updateUserAvatarUrl: Thunk<UserStore, string, any, UserStore, Promise<void>>;
    uploadUserAvatar: Thunk<UserStore, File, any, UserStore, Promise<void>>;
    removeUserAvatar: Thunk<UserStore, void, any, UserStore, Promise<void>>;
}

const user: UserStore = {
    data: undefined,
    setUserData: action((state, payload) => {
        state.data = payload;
    }),

    updateUserData: action((state, payload) => {
        // @ts-expect-error limitation of Typescript, can't do much about that currently unfortunately.
        state.data = { ...state.data, ...payload };
    }),

    updateUserEmail: thunk(async (actions, payload) => {
        await updateAccountEmail(payload.email, payload.password);

        actions.updateUserData({ email: payload.email });
    }),

    updateUserAvatarUrl: thunk(async (actions, avatarUrl) => {
        const url = await updateAccountAvatarUrl(avatarUrl);

        actions.updateUserData({ avatarURL: url });
    }),

    uploadUserAvatar: thunk(async (actions, file) => {
        const url = await uploadAccountAvatar(file);

        actions.updateUserData({ avatarURL: url });
    }),

    removeUserAvatar: thunk(async actions => {
        await removeAccountAvatar();

        actions.updateUserData({ avatarURL: null });
    }),
};

export default user;
