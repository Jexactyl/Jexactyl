import { useEffect, useState } from 'react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ArchiveIcon, DocumentDownloadIcon } from '@heroicons/react/outline';
import AdminTable, { Loading, NoItems, TableBody, TableHead, TableHeader, TableRow } from '@/elements/AdminTable';
import { Button } from '@/elements/button';
import Tooltip from '@/elements/tooltip/Tooltip';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { bytesToString } from '@/lib/formatters';
import { downloadLogArchive, downloadLogFile, getLogFiles, LogFile } from '@/api/routes/admin/settings';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [logs, setLogs] = useState<LogFile[] | undefined>(undefined);
    const [downloading, setDownloading] = useState<string | null>(null);

    const load = () => {
        clearFlashes();

        getLogFiles()
            .then(setLogs)
            .catch(error => clearAndAddHttpError({ key: 'settings:debug', error }));
    };

    useEffect(() => {
        load();
    }, []);

    const download = (name: string) => {
        setDownloading(name);

        downloadLogFile(name)
            .catch(error => clearAndAddHttpError({ key: 'settings:debug', error }))
            .finally(() => setDownloading(null));
    };

    const downloadAll = () => {
        setDownloading('__archive__');

        downloadLogArchive()
            .catch(error => clearAndAddHttpError({ key: 'settings:debug', error }))
            .finally(() => setDownloading(null));
    };

    const totalErrors = (logs ?? []).reduce((total, log) => total + log.errors, 0);
    const totalWarnings = (logs ?? []).reduce((total, log) => total + log.warnings, 0);

    return (
        <>
            <FlashMessageRender byKey={'settings:debug'} css={{ marginBottom: '1rem' }} />
            <div className={'w-full flex flex-row items-center mb-4'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <p className={'text-base text-neutral-400'}>
                        {logs === undefined
                            ? 'Checking for issues with the Panel...'
                            : totalErrors > 0
                            ? `Found ${totalErrors} error${totalErrors === 1 ? '' : 's'} and ${totalWarnings} warning${
                                  totalWarnings === 1 ? '' : 's'
                              } across ${logs.length} log file${logs.length === 1 ? '' : 's'}.`
                            : 'No errors have been found in the Panel logs.'}
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Button onClick={downloadAll} disabled={!logs?.length || downloading !== null}>
                        <ArchiveIcon className={'h-4 w-4 mr-2'} />
                        {downloading === '__archive__' ? 'Preparing...' : 'Download All (.zip)'}
                    </Button>
                </div>
            </div>
            <AdminTable>
                <div className={'overflow-x-auto'}>
                    <table className={'w-full table-auto'}>
                        <TableHead>
                            <TableHeader name={'File'} />
                            <TableHeader name={'Size'} />
                            <TableHeader name={'Last Modified'} />
                            <TableHeader name={'Errors'} />
                            <TableHeader name={'Warnings'} />
                            <TableHeader name={''} />
                        </TableHead>
                        <TableBody>
                            {logs !== undefined &&
                                logs.map(log => (
                                    <TableRow key={log.name}>
                                        <td className={'px-6 py-4 text-sm text-neutral-200 text-left'}>
                                            <code className={'font-mono bg-neutral-900 rounded py-1 px-2'}>
                                                {log.name}
                                            </code>
                                        </td>
                                        <td className={'px-6 text-sm text-neutral-200 text-left whitespace-nowrap'}>
                                            {bytesToString(log.size)}
                                        </td>
                                        <td className={'px-6 text-sm text-neutral-200 text-left whitespace-nowrap'}>
                                            <Tooltip
                                                placement={'top'}
                                                content={format(log.modifiedAt, 'MMM do, yyyy H:mm:ss')}
                                            >
                                                <span>
                                                    {formatDistanceToNowStrict(log.modifiedAt, { addSuffix: true })}
                                                </span>
                                            </Tooltip>
                                        </td>
                                        <td className={'px-6 text-sm text-left whitespace-nowrap'}>
                                            <span className={log.errors > 0 ? 'text-red-400' : 'text-neutral-200'}>
                                                {log.errors}
                                            </span>
                                        </td>
                                        <td className={'px-6 text-sm text-left whitespace-nowrap'}>
                                            <span className={log.warnings > 0 ? 'text-yellow-400' : 'text-neutral-200'}>
                                                {log.warnings}
                                            </span>
                                        </td>
                                        <td className={'px-6 py-4 text-sm text-right whitespace-nowrap'}>
                                            <button
                                                className={
                                                    'text-neutral-400 hover:text-cyan-400 transition-colors duration-75 disabled:opacity-50'
                                                }
                                                disabled={downloading !== null}
                                                onClick={() => download(log.name)}
                                            >
                                                <DocumentDownloadIcon className={'h-5 w-5'} />
                                            </button>
                                        </td>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </table>

                    {logs === undefined ? <Loading /> : logs.length < 1 ? <NoItems /> : null}
                </div>
            </AdminTable>
        </>
    );
};
