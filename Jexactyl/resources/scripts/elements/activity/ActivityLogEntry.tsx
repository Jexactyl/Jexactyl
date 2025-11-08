import * as React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/elements/tooltip/Tooltip';
import Translate from '@/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/account';
import ActivityLogMetaButton from '@/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import style from './style.module.css';
import Avatar from '@/elements/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';
import { useStoreState } from '@/state/hooks';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div
            className={'group grid grid-cols-10 py-4 last:rounded-b last:border-0 border-b-2 border-black/50'}
            style={{ backgroundColor: colors.secondary }}
        >
            <div className={'hidden select-none items-center justify-center 2xl:col-span-1 2xl:flex'}>
                <div className={'flex h-10 w-10 items-center overflow-hidden rounded-full bg-slate-600'}>
                    <Avatar name={actor?.uuid || 'system'} />
                </div>
            </div>
            <div className={'col-span-10 flex sm:col-span-9'}>
                <div className={'flex-1 px-4 sm:px-0'}>
                    <div className={'flex items-center text-slate-50'}>
                        <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                            <span className={'font-bold'}>{actor?.username || 'System'}</span>
                        </Tooltip>
                        <span className={'text-slate-400 mx-2'}>&bull;</span>
                        <Link
                            to={`#${pathTo({ event: activity.event })}`}
                            className={
                                'text-gray-300 transition-colors duration-75 hover:text-cyan-400 active:text-cyan-400'
                            }
                        >
                            {activity.description ?? activity.event}
                        </Link>
                        <div className={classNames(style.icons, 'group-hover:text-slate-300')}>
                            {activity.isApi && (
                                <Tooltip placement={'top'} content={'Using API Key'}>
                                    <TerminalIcon />
                                </Tooltip>
                            )}
                            {activity.event.startsWith('server:sftp.') && (
                                <Tooltip placement={'top'} content={'Using SFTP'}>
                                    <FolderOpenIcon />
                                </Tooltip>
                            )}
                            {children}
                        </div>
                    </div>
                    <p className={style.description}>
                        <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                    </p>
                    <div className={'mt-1 flex items-center text-sm'}>
                        {activity.ip && (
                            <span>
                                {activity.ip}
                                <span className={'text-slate-400'}>&nbsp;|&nbsp;</span>
                            </span>
                        )}
                        <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                            <span>{formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}</span>
                        </Tooltip>
                    </div>
                </div>
                {activity.hasAdditionalMetadata && <ActivityLogMetaButton meta={activity.properties} />}
            </div>
        </div>
    );
};
