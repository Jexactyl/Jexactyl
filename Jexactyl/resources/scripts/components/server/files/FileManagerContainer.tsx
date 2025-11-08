import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import tw from 'twin.macro';

import { httpErrorToHuman } from '@/api/http';
import Spinner from '@/elements/Spinner';
import FileObjectGrid from '@server/files/FileObjectGrid';
import FileManagerBreadcrumbs from '@server/files/FileManagerBreadcrumbs';
import { type FileObject } from '@definitions/server';
import NewDirectoryButton from '@server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/elements/Can';
import { ServerError } from '@/elements/ScreenBlock';
import { Button } from '@/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@server/files/FileManagerStatus';
import MassActionsBar from '@server/files/MassActionsBar';
import UploadButton from '@server/files/UploadButton';
import { useStoreActions, useStoreState } from '@/state/hooks';
import ErrorBoundary from '@/elements/ErrorBoundary';
import { FileActionCheckbox } from '@server/files/SelectFileCheckbox';
import style from './style.module.css';
import FadeTransition from '@/elements/transitions/FadeTransition';
import { usePersistedState } from '@/plugins/usePersistedState';
import { faBorderAll, faFolderPlus, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileObjectList from './FileObjectList';
import CopyOnClick from '@/elements/CopyOnClick';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import TitledGreyBox from '@/elements/TitledGreyBox';
import { ip } from '@/lib/formatters';
import PageContentBlock from '@/elements/PageContentBlock';
import { hashToPath } from '@/lib/helpers';

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1]?.name);
};

export default () => {
    const id = ServerContext.useStoreState(state => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState(state => state.files.directory);
    const clearFlashes = useStoreActions(actions => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions(actions => actions.files.setDirectory);
    const [gridView, setGridView] = usePersistedState<boolean>(`${id}_file_manager_view`, false);

    const sftp = ServerContext.useStoreState(state => state.server.data!.sftpDetails);
    const username = useStoreState(state => state.user.data!.username);
    const setSelectedFiles = ServerContext.useStoreActions(actions => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState(state => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        void mutate();
    }, [directory]);

    const onSelectAllClick = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map(file => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <PageContentBlock
            title={'File Manager'}
            header
            description={'Control your files and folders via the UI.'}
            showFlashKey={'files'}
        >
            <ErrorBoundary>
                <div className={'mb-4 flex flex-wrap-reverse md:flex-nowrap'}>
                    <FileManagerBreadcrumbs
                        renderLeft={
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-4`}
                                checked={selectedFilesLength === (files?.length === 0 ? -1 : files?.length)}
                                onChange={onSelectAllClick}
                            />
                        }
                    />
                    <Can action={'file.create'}>
                        <div className={style.manager_actions}>
                            <FileManagerStatus />
                            <NewDirectoryButton />
                            <UploadButton />
                            <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                <Button>New File</Button>
                            </NavLink>
                            <Button onClick={() => setGridView(!gridView)}>
                                <FontAwesomeIcon icon={gridView ? faList : faBorderAll} fixedWidth />
                            </Button>
                        </div>
                    </Can>
                </div>
            </ErrorBoundary>
            <div className={'grid xl:grid-cols-4 gap-4'}>
                <div className={'xl:col-span-3'}>
                    {!files ? (
                        <Spinner size={'large'} centered />
                    ) : (
                        <>
                            {!files.length ? (
                                <p css={tw`text-sm text-neutral-400 text-center`}>This directory seems to be empty.</p>
                            ) : (
                                <FadeTransition duration="duration-150" appear show>
                                    <div>
                                        {files.length > 250 && (
                                            <div css={tw`rounded bg-yellow-400 mb-px p-3`}>
                                                <p css={tw`text-yellow-900 text-sm text-center`}>
                                                    This directory is too large to display in the browser, limiting the
                                                    output to the first 250 files.
                                                </p>
                                            </div>
                                        )}
                                        {gridView ? (
                                            <div className={'grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-4'}>
                                                {sortFiles(files.slice(0, 250)).map(file => (
                                                    <FileObjectGrid key={file.key} file={file} />
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                {sortFiles(files.slice(0, 250)).map(file => (
                                                    <FileObjectList key={file.key} file={file} />
                                                ))}
                                            </>
                                        )}
                                        <MassActionsBar />
                                    </div>
                                </FadeTransition>
                            )}
                        </>
                    )}
                </div>
                <Can action={'file.sftp'}>
                    <TitledGreyBox title={'SFTP Details'} icon={faFolderPlus} css={tw`xl:mt-0 mt-6 h-auto`}>
                        <div>
                            <Label>Server Address</Label>
                            <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                            </CopyOnClick>
                        </div>
                        <div css={tw`mt-6`}>
                            <Label>Username</Label>
                            <CopyOnClick text={`${username}.${id}`}>
                                <Input type={'text'} value={`${username}.${id}`} readOnly />
                            </CopyOnClick>
                        </div>
                        <div css={tw`mt-6 flex items-center`}>
                            <div css={tw`flex-1`}>
                                <div css={tw`border-l-4 border-cyan-500 p-3`}>
                                    <p css={tw`text-xs text-neutral-200`}>
                                        Your SFTP password is the same as the password you use to access this panel.
                                    </p>
                                </div>
                            </div>
                            <div css={tw`ml-4`}>
                                <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                    <Button.Text variant={Button.Variants.Secondary}>Launch SFTP</Button.Text>
                                </a>
                            </div>
                        </div>
                    </TitledGreyBox>
                </Can>
            </div>
        </PageContentBlock>
    );
};
