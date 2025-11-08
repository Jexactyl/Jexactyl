import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFloppyDisk,
    faInfoCircle,
    faMemory,
    faMicrochip,
    faPlus,
    faPowerOff,
    faTrash,
    faXmarkCircle,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { ServerPowerState, ServerStats, type Server } from '@definitions/server';
import { getServerResourceUsage } from '@/api/routes/server';
import { useStoreState } from '@/state/hooks';
import classNames from 'classnames';
import { removeServerFromGroup } from '@/api/routes/server/groups';
import { type ServerGroup } from '@definitions/server';
import Pill from '@/elements/Pill';
import { VisibleDialog } from './groups/ServerGroupDialog';
import useFlash from '@/plugins/useFlash';

export function statusToColor(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'text-green-500';
        case 'starting':
        case 'stopping':
            return 'text-yellow-500';
        default:
            return 'text-red-500';
    }
}

const UtilBox = ({
    utilised,
    icon,
    rounded,
    server,
}: {
    utilised: number;
    icon: IconDefinition;
    rounded?: string;
    server?: Server;
}) => {
    return (
        <div
            className={classNames(
                'col-span-2 lg:col-span-1 w-full h-full bg-white/10 lg:shadow-xl m-auto px-4 py-2',
                rounded === 'left' && 'lg:rounded-l-lg',
                rounded === 'right' && 'lg:rounded-r-lg',
                rounded === 'full' && 'lg:rounded-lg lg:col-span-3',
            )}
        >
            <div className={'text-gray-300 font-bold text-center'}>
                <p className={'my-auto inline-flex text-sm'}>
                    <FontAwesomeIcon icon={icon} className={'my-auto mr-1'} size={'xs'} />
                    <p className={'my-auto'}>
                        {utilised > -1
                            ? `${utilised === Infinity ? 0 : utilised}%`
                            : `Server is ${server?.isTransferring ? 'transferring' : server?.status ?? 'offline'}`}
                    </p>
                </p>
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
                addFlash({ type: 'success', key: 'dashboard:groups', message: 'Server group removed successfully.' });
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
        // Don't waste a HTTP request if there is nothing important to show to the user because
        // the server is suspended.
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const cpuUsed =
        server.limits.cpu === 0 ? stats?.cpuUsagePercent : (stats?.cpuUsagePercent ?? 0) / (server.limits.cpu / 100);
    const diskUsed = ((stats?.diskUsageInBytes ?? 0) / 1024 / 1024 / server.limits.disk) * 100;
    const memoryUsed = ((stats?.memoryUsageInBytes ?? 0) / 1024 / 1024 / server.limits.memory) * 100;

    return (
        <>
            <div
                className={'w-full p-4 rounded-lg grid grid-cols-2 lg:grid-cols-12 mb-2'}
                style={{ backgroundColor: colors.background }}
            >
                <FontAwesomeIcon
                    className={classNames(statusToColor(stats?.status ?? 'offline'), 'my-auto ml-4 col-span-1')}
                    icon={server.status === 'suspended' ? faXmarkCircle : faPowerOff}
                    size={'lg'}
                />
                <Link
                    to={`/server/${server.id}`}
                    className="whitespace-nowrap text-white col-span-1 lg:col-span-6 mb-4 lg:mb-0 hover:brightness-150 transition duration-300"
                >
                    {server.name}
                    <div className={'text-gray-500 text-xs my-auto'}>
                        {server.allocations[0]?.ip.toString()}:{server.allocations[0]?.port.toString()}
                    </div>
                </Link>
                <div className={'col-span-1 lg:col-span-2 my-auto mr-2'}>
                    {group && group.id === server.groupId && !removed ? (
                        <Pill size={'small'} type={'unknown'}>
                            <span style={{ color: group?.color }} className={'cursor-default ml-3'}>
                                {group.name}
                                <div
                                    onClick={onDelete}
                                    className={'opacity-0 hover:opacity-100 transition duration-200 inline-flex'}
                                >
                                    <FontAwesomeIcon icon={faTrash} size={'xs'} color={'red'} className={'ml-1'} />
                                </div>
                            </span>
                        </Pill>
                    ) : (
                        <div
                            onClick={() => setOpen({ open: 'add', serverId: server.uuid })}
                            className={
                                'hidden xl:inline-flex leading-5 font-medium text-2xs px-2 py-0.25 text-gray-500 rounded-full border border-gray-400 border-dashed cursor-pointer hover:bg-white/10 hover:text-white transition duration-300'
                            }
                        >
                            <FontAwesomeIcon icon={faPlus} className={'mr-1 my-auto'} />
                            Add Group
                        </div>
                    )}
                </div>
                {server.status || stats?.status === 'offline' ? (
                    <UtilBox rounded={'full'} utilised={-1} icon={faInfoCircle} server={server} />
                ) : (
                    <>
                        <UtilBox rounded={'left'} utilised={Number(cpuUsed?.toFixed(0))} icon={faMicrochip} />
                        <UtilBox utilised={Number(memoryUsed.toFixed(0))} icon={faMemory} />
                        <UtilBox rounded={'right'} utilised={Number(diskUsed.toFixed(0))} icon={faFloppyDisk} />
                    </>
                )}
            </div>
        </>
    );
};
