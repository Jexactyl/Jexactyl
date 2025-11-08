import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faLock } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/elements/Spinner';
import { bytesToString } from '@/lib/formatters';
import Can from '@/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@server/backups/BackupContextMenu';
import tw from 'twin.macro';
import GreyRowBox from '@/elements/GreyRowBox';
import { getBackups } from '@/api/routes/server/backups';
import { type Backup } from '@definitions/server';
import { SocketEvent } from '@server/events';
import { useState } from 'react';

interface Props {
    backup: Backup;
    className?: string;
}

export default ({ backup }: Props) => {
    const { mutate } = getBackups();
    const [visible, setVisible] = useState<boolean>(false);

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, async data => {
        try {
            const parsed = JSON.parse(data);

            await mutate(
                data => ({
                    ...data!,
                    items: data!.items.map(b =>
                        b.uuid !== backup.uuid
                            ? b
                            : {
                                  ...b,
                                  isSuccessful: parsed.is_successful || true,
                                  checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                                  bytes: parsed.file_size || 0,
                                  completedAt: new Date(),
                              },
                    ),
                }),
                false,
            );
        } catch (e) {
            console.warn(e);
        }
    });

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`mr-4`}>
                    {backup.completedAt !== null ? (
                        backup.isLocked ? (
                            <FontAwesomeIcon icon={faLock} css={tw`text-yellow-500 mx-3`} size={'lg'} />
                        ) : (
                            <FontAwesomeIcon icon={faArchive} css={tw`text-neutral-300 mx-3`} size={'lg'} />
                        )
                    ) : (
                        <Spinner size={'small'} />
                    )}
                </div>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center mb-1`}>
                        {backup.completedAt !== null && !backup.isSuccessful && (
                            <span
                                css={tw`bg-red-500 py-px px-2 rounded-full text-white text-xs uppercase border border-red-600 mr-2`}
                            >
                                Failed
                            </span>
                        )}
                        <p css={tw`break-words truncate font-semibold`}>{backup.name}</p>
                        {backup.completedAt !== null && backup.isSuccessful && (
                            <span css={tw`ml-3 text-neutral-300 text-xs font-extralight hidden sm:inline`}>
                                {bytesToString(backup.bytes)}
                            </span>
                        )}
                    </div>
                    <p css={tw`mt-1 md:mt-0 text-xs text-neutral-400 font-mono truncate`}>{backup.checksum}</p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-8 md:text-center`}>
                <p title={format(backup.createdAt, 'ddd, MMMM do, yyyy HH:mm:ss')} css={tw`text-sm`}>
                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Created</p>
            </div>
            <Can action={['backup.download', 'backup.restore', 'backup.delete']} matchAny>
                <div css={tw`mr-3 text-gray-400 hover:text-white duration-300`}>
                    <BackupContextMenu backup={backup} visible={visible} setVisible={setVisible} />
                </div>
            </Can>
        </GreyRowBox>
    );
};
