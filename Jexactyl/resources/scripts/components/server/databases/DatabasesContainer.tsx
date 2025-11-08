import { useEffect, useState } from 'react';
import { getDatabases } from '@/api/routes/server/databases';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/elements/FlashMessageRender';
import DatabaseRow from '@server/databases/DatabaseRow';
import Spinner from '@/elements/Spinner';
import CreateDatabaseButton from '@server/databases/CreateDatabaseButton';
import Can from '@/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { useDeepMemoize } from '@/plugins/useDeepMemoize';
import FadeTransition from '@/elements/transitions/FadeTransition';
import PageContentBlock from '@/elements/PageContentBlock';

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState(state => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);

    const databases = useDeepMemoize(ServerContext.useStoreState(state => state.databases.data));
    const setDatabases = ServerContext.useStoreActions(state => state.databases.setDatabases);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');

        getDatabases(uuid)
            .then(databases => setDatabases(databases))
            .catch(error => {
                console.error(error);
                addError({ key: 'databases', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <PageContentBlock title={'Databases'} header description={'Assign databases directly to your server.'}>
            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />
            {!databases.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <FadeTransition duration="duration-150" show>
                    <>
                        {databases.length > 0 ? (
                            databases.map((database, index) => (
                                <DatabaseRow
                                    key={database.id}
                                    database={database}
                                    className={index > 0 ? 'mt-1' : undefined}
                                />
                            ))
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-300`}>
                                {databaseLimit > 0
                                    ? 'It looks like you have no databases.'
                                    : 'Databases cannot be created for this server.'}
                            </p>
                        )}
                        <Can action={'database.create'}>
                            <div css={tw`mt-6 flex items-center justify-end`}>
                                {databaseLimit > 0 && databases.length > 0 && (
                                    <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                                        {databases.length} of {databaseLimit} databases have been allocated to this
                                        server.
                                    </p>
                                )}
                                {databaseLimit > 0 && databaseLimit !== databases.length && (
                                    <CreateDatabaseButton css={tw`flex justify-end mt-6`} />
                                )}
                            </div>
                        </Can>
                    </>
                </FadeTransition>
            )}
        </PageContentBlock>
    );
};
