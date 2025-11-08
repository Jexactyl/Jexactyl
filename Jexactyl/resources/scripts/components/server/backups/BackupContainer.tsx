import { useContext, useEffect, useState } from 'react';
import Spinner from '@/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import Can from '@/elements/Can';
import CreateBackupButton from '@server/backups/CreateBackupButton';
import FlashMessageRender from '@/elements/FlashMessageRender';
import BackupRow from '@server/backups/BackupRow';
import tw from 'twin.macro';
import { getBackups, Context } from '@/api/routes/server/backups';
import { ServerContext } from '@/state/server';
import Pagination from '@/elements/Pagination';
import PageContentBlock from '@/elements/PageContentBlock';

const BackupContainer = () => {
    const { page, setPage } = useContext(Context);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: backups, error, isValidating } = getBackups();

    const backupLimit = ServerContext.useStoreState(state => state.server.data!.featureLimits.backups);

    useEffect(() => {
        if (!error) {
            clearFlashes('backups');

            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [error]);

    if (!backups || (error && isValidating)) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <PageContentBlock title={'Backups'} header description={'Keep your data safe with backups.'}>
            <FlashMessageRender byKey={'backups'} css={tw`mb-4`} />
            <Pagination data={backups} onPageSelect={setPage}>
                {({ items }) =>
                    !items.length ? (
                        // Don't show any error messages if the server has no backups and the user cannot
                        // create additional ones for the server.
                        !backupLimit ? null : (
                            <p css={tw`text-center text-sm text-neutral-300`}>
                                {page > 1
                                    ? "Looks like we've run out of backups to show you, try going back a page."
                                    : 'It looks like there are no backups currently stored for this server.'}
                            </p>
                        )
                    ) : (
                        items.map((backup, index) => (
                            <BackupRow key={backup.uuid} backup={backup} css={index > 0 ? tw`mt-2` : undefined} />
                        ))
                    )
                }
            </Pagination>
            {backupLimit === 0 && (
                <p css={tw`text-center text-sm text-neutral-300`}>
                    Backups cannot be created for this server because the backup limit is set to 0.
                </p>
            )}
            <Can action={'backup.create'}>
                <div css={tw`mt-6 sm:flex items-center justify-end`}>
                    {backupLimit > 0 && backups.backupCount > 0 && (
                        <p css={tw`text-sm text-neutral-300 mb-4 sm:mr-6 sm:mb-0`}>
                            {backups.backupCount} of {backupLimit} backups have been created for this server.
                        </p>
                    )}
                    {backupLimit > 0 && backupLimit > backups.backupCount && (
                        <CreateBackupButton css={tw`w-full sm:w-auto`} />
                    )}
                </div>
            </Can>
        </PageContentBlock>
    );
};

export default () => {
    const [page, setPage] = useState<number>(1);
    return (
        <Context.Provider value={{ page, setPage }}>
            <BackupContainer />
        </Context.Provider>
    );
};
