import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ActivityLogFilters, useServerActivityLogs } from '@/api/routes/admin/activity';
import { useServerFromRoute } from '@/api/routes/admin/servers';
import { useFlashKey } from '@/plugins/useFlash';
import PaginationFooter from '@/elements/table/PaginationFooter';
import { DesktopComputerIcon, XCircleIcon } from '@heroicons/react/solid';
import Spinner from '@/elements/Spinner';
import { styles as btnStyles } from '@/elements/button/index';
import ActivityLogEntry from '@/elements/activity/ActivityLogEntry';
import Tooltip from '@/elements/tooltip/Tooltip';
import useLocationHash from '@/plugins/useLocationHash';

export default () => {
    const { hash } = useLocationHash();
    const { data: server } = useServerFromRoute();
    const { clearAndAddHttpError } = useFlashKey('server:activity');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });
    const { data, isValidating, error } = useServerActivityLogs(server!.id, filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters(value => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <>
            {(filters.filters?.event || filters.filters?.ip) && (
                <div className={'mb-2 flex justify-end'}>
                    <Link
                        to={'#'}
                        className={classNames(btnStyles.button, btnStyles.text, 'w-full sm:w-auto')}
                        onClick={() => setFilters(value => ({ ...value, filters: {} }))}
                    >
                        Clear Filters <XCircleIcon className={'ml-2 h-4 w-4'} />
                    </Link>
                </div>
            )}
            {!data && isValidating ? (
                <Spinner centered />
            ) : !data?.items.length ? (
                <p className={'text-center text-sm text-slate-400'}>No activity logs available for this server.</p>
            ) : (
                <div className={'bg-slate-700'}>
                    {data?.items.map(activity => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            {typeof activity.properties.useragent === 'string' && (
                                <Tooltip content={activity.properties.useragent} placement={'top'}>
                                    <span>
                                        <DesktopComputerIcon />
                                    </span>
                                </Tooltip>
                            )}
                        </ActivityLogEntry>
                    ))}
                </div>
            )}
            {data && (
                <PaginationFooter
                    pagination={data.pagination}
                    onPageSelect={page => setFilters(value => ({ ...value, page }))}
                />
            )}
        </>
    );
};
