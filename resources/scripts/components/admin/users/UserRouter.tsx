import type { Action, Actions } from 'easy-peasy';
import { action, createContextStore, useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { getUser } from '@/api/admin/users';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import { SubNavigation, SubNavigationLink } from '@/components/admin/SubNavigation';
import UserAboutContainer from '@/components/admin/users/view/AboutContainer';
import UserServers from '@/components/admin/users/view/ServersContainer';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import type { ApplicationStore } from '@/state';
import type { User } from '@definitions/admin';
import { ServerIcon, UserIcon } from '@heroicons/react/outline';

interface ctx {
    user: User | undefined;
    setUser: Action<ctx, User | undefined>;
}

export const Context = createContextStore<ctx>({
    user: undefined,

    setUser: action((state, payload) => {
        state.user = payload;
    }),
});

const UserRouter = () => {
    const params = useParams<'id'>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const [loading, setLoading] = useState(true);

    const user = Context.useStoreState(state => state.user);
    const setUser = Context.useStoreActions(actions => actions.setUser);

    useEffect(() => {
        clearFlashes('user');

        getUser(Number(params.id), ['role'])
            .then(user => setUser(user))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'user', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || user === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'user'} css={tw`mb-4`} />

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'} />
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'User - ' + user.id}>
            <div css={tw`w-full flex flex-row items-center mb-4`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{user.email}</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        {user.uuid}
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'user'} css={tw`mb-4`} />

            <SubNavigation>
                <SubNavigationLink to={`/admin/users/${params.id}`} name={'About'}>
                    <UserIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/users/${params.id}/servers`} name={'Servers'}>
                    <ServerIcon />
                </SubNavigationLink>
            </SubNavigation>

            <Routes>
                <Route path="" element={<UserAboutContainer />} />
                <Route path="servers" element={<UserServers />} />
            </Routes>
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <UserRouter />
        </Context.Provider>
    );
};
