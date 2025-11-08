import { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Spinner from '@/elements/Spinner';
import AddSubuserButton from '@server/users/AddSubuserButton';
import UserRow from '@server/users/UserRow';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { getSubusers } from '@/api/routes/server/subusers';
import { httpErrorToHuman } from '@/api/http';
import Can from '@/elements/Can';
import tw from 'twin.macro';
import PageContentBlock from '@/elements/PageContentBlock';

export default () => {
    const [loading, setLoading] = useState(true);

    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const subusers = ServerContext.useStoreState(state => state.subusers.data);
    const setSubusers = ServerContext.useStoreActions(actions => actions.subusers.setSubusers);

    const limit = ServerContext.useStoreState(state => state.server.data!.featureLimits.subusers);

    const permissions = useStoreState((state: ApplicationStore) => state.permissions.data);
    const getPermissions = useStoreActions((actions: Actions<ApplicationStore>) => actions.permissions.getPermissions);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        clearFlashes('users');
        getSubusers(uuid)
            .then(subusers => {
                setSubusers(subusers);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                addError({ key: 'users', message: httpErrorToHuman(error) });
            });
    }, []);

    useEffect(() => {
        getPermissions().catch(error => {
            addError({ key: 'users', message: httpErrorToHuman(error) });
            console.error(error);
        });
    }, []);

    if (!subusers.length && (loading || !Object.keys(permissions).length)) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <PageContentBlock title={'Subusers'} header description={'Control the access of other users to this server.'}>
            <FlashMessageRender byKey={'users'} css={tw`mb-4`} />
            {!subusers.length ? (
                <p css={tw`text-center text-sm text-neutral-300`}>It looks like you don&apos;t have any subusers.</p>
            ) : (
                subusers.map(subuser => <UserRow key={subuser.uuid} subuser={subuser} />)
            )}
            <Can action={'user.create'}>
                <div css={tw`mt-6 sm:flex items-center justify-end`}>
                    {limit > 0 && subusers.length > 0 && (
                        <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                            {subusers.length} of {limit} subusers have been created for this server.
                        </p>
                    )}
                    {limit > 0 && limit > subusers.length && <AddSubuserButton css={tw`w-full sm:w-auto`} />}
                </div>
            </Can>
        </PageContentBlock>
    );
};
