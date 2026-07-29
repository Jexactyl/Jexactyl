import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMemory,
    faMicrochip,
    faPlus,
    faPowerOff,
    faTrash,
    faXmarkCircle,
    faNetworkWired,
    faServer,
    faClock,
    faArrowUpRightFromSquare,
    IconDefinition,
    faIdBadge,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { ServerPowerState, ServerStats, type Server } from '@definitions/server';
import { getServerResourceUsage } from '@/api/routes/server';
import { useStoreState } from '@/state/hooks';
import classNames from 'classnames';
import { removeServerFromGroup } from '@/api/routes/server/groups';
import { type ServerGroup } from '@definitions/server';
import { VisibleDialog } from './groups/ServerGroupDialog';
import useFlash from '@/plugins/useFlash';
import { timeUntil } from '../server/billing/ServerBillingContainer';

export function statusToColor(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'text-emerald-400';
        case 'starting':
            return 'text-sky-400';
        case 'stopping':
            return 'text-amber-400';
        default:
            return 'text-red-400';
    }
}

export function statusToBg(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'bg-emerald-500/10 border-emerald-500/20';
        case 'starting':
            return 'bg-sky-500/10 border-sky-500/20';
        case 'stopping':
            return 'bg-amber-500/10 border-amber-500/20';
        default:
            return 'bg-red-500/10 border-red-500/20';
    }
}

export function statusToLabel(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'Online';
        case 'starting':
            return 'Starting';
        case 'stopping':
            return 'Stopping';
        default:
            return 'Offline';
    }
}

/** Animated pulsing dot indicator */
const StatusDot = ({ state }: { state?: ServerPowerState }) => {
    const color = {
        running: 'bg-emerald-400',
        starting: 'bg-sky-400',
        stopping: 'bg-amber-400',
    };

    return (
        <span className={'relative flex h-2.5 w-2.5'}>
            {(state === 'running' || state === 'starting') && (
                <span
                    className={classNames(
                        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
                        color,
                    )}
                />
            )}
            <span className={classNames('relative inline-flex rounded-full h-2.5 w-2.5', color)} />
        </span>
    );
};

/** Resource bar with animated fill */
const ResourceBar = ({
    value,
    icon,
    label,
    colorClass,
}: {
    value: number;
    icon: IconDefinition;
    label: string;
    colorClass: string;
}) => {
    const clamped = Math.min(Math.max(value, 0), 100);
    const barColor = clamped >= 90 ? 'bg-red-400' : clamped >= 70 ? 'bg-amber-400' : colorClass;

    return (
        <div className={'w-full flex flex-col gap-1 min-w-0'}>
            <div className={'flex items-center justify-between gap-2'}>
                <span className={'flex items-center gap-1.5 text-xs text-gray-400 font-medium tracking-wide uppercase'}>
                    <FontAwesomeIcon icon={icon} className={'text-gray-500'} size={'xs'} />
                    {label}
                </span>
                <span
                    className={classNames(
                        'text-xs font-mono font-semibold tabular-nums',
                        clamped >= 90 ? 'text-red-400' : clamped >= 70 ? 'text-amber-400' : 'text-gray-200',
                    )}
                >
                    {clamped.toFixed(0)}%
                </span>
            </div>
            <div className={'h-1.5 w-full rounded-full bg-white/10 overflow-hidden'}>
                <div
                    className={classNames('h-full rounded-full transition-all duration-700 ease-out', barColor)}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
};

type Timer = ReturnType<typeof setInterval>;

export default ({
    server,
    group,
    setOpen,
}: {
    server: Server;
    group?: ServerGroup;
    setOpen: React.Dispatch<React.SetStateAction<VisibleDialog>>;
}) => {
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const [stats, setStats] = useState<ServerStats>();
    const colors = useStoreState(state => state.theme.data!.colors);
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [removed, setRemoved] = useState(false);

    const onDelete = () => {
        clearFlashes();
        removeServerFromGroup(group!.id, server.uuid)
            .then(() => {
                addFlash({ type: 'success', key: 'dashboard:groups', message: 'Server removed from group.' });
                setOpen({ open: 'none', serverId: undefined });
                setRemoved(true);
            })
            .catch(error => clearAndAddHttpError({ key: 'dashboard:groups', error }));
    };

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then(data => setStats(data))
            .catch(error => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const cpuUsed =
        server.limits.cpu === 0
            ? stats?.cpuUsagePercent ?? 0
            : (stats?.cpuUsagePercent ?? 0) / (server.limits.cpu / 100);
    const memoryUsed = ((stats?.memoryUsageInBytes ?? 0) / 1024 / 1024 / server.limits.memory) * 100;

    const powerState: ServerPowerState | undefined = stats?.status;
    const isOfflineOrSuspended = !!server.status || stats?.status === 'offline';
    const isTransferring = server.isTransferring;

    const allocation = server.allocations[0];
    const renewal = server.renewalDate ? timeUntil(server.renewalDate) : null;

    const hasGroup = group && group.id === server.groupId && !removed;

    return (
        <div
            className={classNames(
                'group relative w-full my-2 rounded-xl border transition-all duration-300',
                'hover:border-white/15 hover:shadow-lg hover:shadow-black/30',
                'border-white/5',
            )}
            style={{ backgroundColor: colors.sidebar }}
        >
            {/* Top accent line matching server status */}
            <div
                className={classNames(
                    'absolute top-0 left-3 right-3 h-px rounded-full transition-all duration-500',
                    powerState === 'running'
                        ? 'bg-emerald-500/50'
                        : powerState === 'starting'
                        ? 'bg-sky-500/50'
                        : powerState === 'stopping'
                        ? 'bg-amber-500/50'
                        : 'bg-red-500/30',
                )}
            />

            <div className={'flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5'}>
                <div className={'flex items-start gap-3 flex-1 min-w-0'}>
                    <div className={'relative flex-shrink-0 mt-0.5'}>
                        <div
                            className={classNames(
                                'w-10 h-10 rounded-lg flex items-center justify-center border',
                                isSuspended ? 'bg-red-500/10 border-red-500/20' : statusToBg(powerState),
                            )}
                        >
                            <FontAwesomeIcon
                                icon={isSuspended ? faXmarkCircle : faServer}
                                className={classNames(
                                    'text-base',
                                    isSuspended ? 'text-red-400' : statusToColor(powerState),
                                )}
                            />
                        </div>
                        <div className={'absolute -bottom-0.5 -right-0.5'}>
                            <StatusDot state={isSuspended ? undefined : powerState} />
                        </div>
                    </div>
                    <div className={'min-w-0 flex-1'}>
                        <div className={'flex flex-wrap items-center gap-2 mb-1'}>
                            <Link
                                to={`/server/${server.id}`}
                                className={
                                    'font-semibold text-white text-sm hover:text-white/80 transition-colors duration-200 truncate max-w-xs'
                                }
                            >
                                {server.name}
                            </Link>
                            <span
                                className={classNames(
                                    'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border',
                                    isSuspended
                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                        : isTransferring
                                        ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                        : statusToBg(powerState) + ' ' + statusToColor(powerState),
                                )}
                            >
                                {isSuspended
                                    ? 'Suspended'
                                    : isTransferring
                                    ? 'Transferring'
                                    : statusToLabel(powerState)}
                            </span>
                            {hasGroup ? (
                                <span
                                    className={
                                        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border border-white/10 bg-white/5'
                                    }
                                >
                                    <span
                                        className={'w-1.5 h-1.5 rounded-full'}
                                        style={{ backgroundColor: group.color }}
                                    />
                                    <span style={{ color: group.color }}>{group.name}</span>
                                    <button
                                        onClick={onDelete}
                                        className={
                                            'ml-0.5 text-gray-600 hover:text-red-400 transition-colors duration-150'
                                        }
                                        title={'Remove from group'}
                                    >
                                        <FontAwesomeIcon icon={faTrash} size={'xs'} />
                                    </button>
                                </span>
                            ) : (
                                <button
                                    onClick={() => setOpen({ open: 'add', serverId: server.uuid })}
                                    className={
                                        'hidden xl:inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 border border-dashed border-gray-700 hover:border-gray-500 rounded-full px-2 py-0.5 transition-all duration-200 hover:bg-white/5'
                                    }
                                >
                                    <FontAwesomeIcon icon={faPlus} size={'xs'} />
                                    Group
                                </button>
                            )}
                        </div>
                        <div className={'flex flex-wrap items-center gap-x-3 gap-y-1'}>
                            {allocation && (
                                <span className={'flex items-center gap-1.5 text-xs text-gray-500'}>
                                    <FontAwesomeIcon icon={faNetworkWired} size={'xs'} className={'text-gray-600'} />
                                    <span className={'font-mono'}>
                                        {allocation.ip}:{allocation.port}
                                    </span>
                                </span>
                            )}
                            {renewal && (
                                <span className={'flex items-center gap-1.5 text-xs text-gray-500'}>
                                    <FontAwesomeIcon icon={faClock} size={'xs'} className={'text-gray-600'} />
                                    <span>
                                        Renews in{' '}
                                        <span
                                            className={classNames(
                                                'font-medium',
                                                renewal.days <= 3 ? 'text-amber-400' : 'text-gray-400',
                                            )}
                                        >
                                            {renewal.days}d {renewal.hours}h
                                        </span>
                                    </span>
                                </span>
                            )}
                            <span className={'flex items-center gap-1.5 text-xs text-gray-600'}>
                                <FontAwesomeIcon icon={faIdBadge} size={'xs'} className={'text-gray-600'} />
                                <span className={'font-mono opacity-60'}>{server.uuid.substring(0, 8)}&hellip;</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className={'flex-shrink-0 w-full lg:w-72 xl:w-80'}>
                    {isOfflineOrSuspended ? (
                        <div
                            className={classNames(
                                'flex items-center justify-center gap-3 h-full min-h-[52px] rounded-lg border px-4 py-3',
                                isSuspended ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5',
                            )}
                        >
                            <FontAwesomeIcon
                                icon={isSuspended ? faXmarkCircle : faPowerOff}
                                className={isSuspended ? 'text-red-400' : 'text-gray-500'}
                                size={'sm'}
                            />
                            <span className={'text-sm text-gray-500'}>
                                {isTransferring
                                    ? 'Transfer in progress…'
                                    : isSuspended
                                    ? 'This server is suspended'
                                    : `Server is ${server.status ?? 'offline'}`}
                            </span>
                        </div>
                    ) : (
                        <div
                            className={
                                'flex justify-between gap-y-3 gap-x-5 bg-white/[0.03] rounded-lg border border-white/5 px-4 py-3'
                            }
                        >
                            <ResourceBar
                                value={Number(cpuUsed?.toFixed(1) ?? 0)}
                                icon={faMicrochip}
                                label={'CPU'}
                                colorClass={'bg-white/50'}
                            />
                            <ResourceBar
                                value={Number(memoryUsed.toFixed(1))}
                                icon={faMemory}
                                label={'Memory'}
                                colorClass={'bg-white/50'}
                            />
                        </div>
                    )}
                </div>
                <div className={'flex-shrink-0 hidden xl:flex items-center'}>
                    <Link
                        to={`/server/${server.id}`}
                        className={
                            'flex items-center gap-1.5 text-xs text-gray-600 hover:text-white border border-white/5 hover:border-white/20 rounded-lg px-3 py-2 bg-white/[0.02] hover:bg-white/10 transition-all duration-200'
                        }
                    >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={'xs'} />
                        Manage
                    </Link>
                </div>
            </div>
        </div>
    );
};
