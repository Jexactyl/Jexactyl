import useSWR from 'swr';
import { loadDirectory } from '@/api/routes/server/directories';
import { type FileObject } from '@definitions/server';
import { ServerContext } from '@/state/server';
import { cleanDirectoryPath } from '@/lib/helpers';

export const getDirectorySwrKey = (uuid: string, directory: string): string => `${uuid}:files:${directory}`;

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const directory = ServerContext.useStoreState(state => state.files.directory);

    return useSWR<FileObject[]>(
        getDirectorySwrKey(uuid, directory),
        () => loadDirectory(uuid, cleanDirectoryPath(directory)),
        {
            focusThrottleInterval: 30000,
            revalidateOnMount: false,
            refreshInterval: 0,
            errorRetryCount: 2,
        },
    );
};
