import type { Action, Actions } from 'easy-peasy';
import { action, createContextStore, useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import { getUser } from '@/api/routes/admin/users';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import UserAboutContainer from '@admin/management/users/view/AboutContainer';
import UserServers from '@admin/management/users/view/ServersContainer';
import Spinner from '@/elements/Spinner';
import FlashMessageRender from '@/elements/FlashMessageRender';
import type { ApplicationStore } from '@/state';
import type { User } from '@definitions/admin';
import { CogIcon, ServerIcon, UserIcon } from '@heroicons/react/outline';
import ManageContainer from './view/ManageContainer';
import { useStoreState } from '@/state/hooks';
import { Button } from '@/elements/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface ctx {
    user: User | undefined;
    setUser: Action<ctx, User | undefined>;
}

export const Context: ReturnType<typeof createContextStore<ctx>> = createContextStore<ctx>({
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

    const theme = useStoreState(state => state.theme.data!);

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
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        {user.uuid}
                    </p>
                </div>
                <div css={tw`flex ml-auto pl-4`}>
                    <Link to={'/admin/users'}>
                        <Button>
                            <FontAwesomeIcon icon={faArrowLeft} className={'mr-2 my-auto'} /> Back to Users
                        </Button>
                    </Link>
                </div>
            </div>

            <FlashMessageRender byKey={'user'} css={tw`mb-4`} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to={`/admin/users/${params.id}`} name={'About'} base>
                    <UserIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/users/${params.id}/servers`} name={'Servers'}>
                    <ServerIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/users/${params.id}/manage`} name={'Manage'}>
                    <CogIcon />
                </SubNavigationLink>
            </SubNavigation>

            <Routes>
                <Route path="" element={<UserAboutContainer />} />
                <Route path="servers" element={<UserServers />} />
                <Route path="manage" element={<ManageContainer />} />
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
