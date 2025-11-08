import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileArchive, faFileImport, faFolder } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';
import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import { join } from 'pathe';

import { type FileObject } from '@definitions/server';
import FileDropdownMenu from '@server/files/FileDropdownMenu';
import SelectFileCheckbox from '@server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { ServerContext } from '@/state/server';
import styles from './style.module.css';
import { useStoreState } from '@/state/hooks';
import { encodePathSegments } from '@/lib/helpers';

function Clickable({ file, children }: { file: FileObject; children: ReactNode }) {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const id = ServerContext.useStoreState(state => state.server.data!.id);
    const directory = ServerContext.useStoreState(state => state.files.directory);

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div className={styles.details}>{children}</div>
    ) : (
        <NavLink
            className={styles.details}
            to={`/server/${id}/files${file.isFile ? '/edit' : '#'}${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}

const MemoizedClickable = memo(Clickable, isEqual);

function FileObjectRow({ file }: { file: FileObject }) {
    const colors = useStoreState(state => state.theme.data!.colors);

    return (
        <div
            className={styles.file_row}
            key={file.name}
            style={{ backgroundColor: colors.secondary }}
            onContextMenu={e => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`pterodactyl:files:ctx:${file.key}`, { detail: e.clientX }));
            }}
        >
            <SelectFileCheckbox name={file.name} />
            <FileDropdownMenu file={file} />
            <MemoizedClickable file={file}>
                <div css={tw`w-full flex justify-center mx-4 mt-8`} style={{ color: colors.primary }}>
                    {file.isFile ? (
                        <FontAwesomeIcon
                            size={'3x'}
                            icon={file.isSymlink ? faFileImport : file.isArchiveType() ? faFileArchive : faFileAlt}
                        />
                    ) : (
                        <FontAwesomeIcon size={'3x'} icon={faFolder} />
                    )}
                </div>
            </MemoizedClickable>
            <div css={tw`text-center truncate text-gray-400 mb-8`}>{file.name}</div>
        </div>
    );
}

export default memo(FileObjectRow, (prevProps, nextProps) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return isEqual(prevFile, nextFile);
});
