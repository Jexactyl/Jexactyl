import tw from 'twin.macro';
import * as Icon from 'react-feather';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Server } from '@/api/server/getServer';
import Spinner from '@/components/elements/Spinner';
import { bytesToString, ip } from '@/lib/formatters';
import GreyRowBox from '@/components/elements/GreyRowBox';
import React, { useEffect, useRef, useState } from 'react';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const IconDescription = styled.p<{ $alarm?: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => props.$alarm && tw`text-red-300`};
`;

const StatusIndicatorBox = styled(GreyRowBox)<{ $status: ServerPowerState | undefined; $bg: string }>`
    ${tw`grid grid-cols-12 gap-4 relative`};

    ${({ $bg }) => `background-image: url("${$bg}");`}
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    & .status-bar {
        ${tw`w-4 h-4 bg-red-500 absolute right-0 top-0 z-20 rounded-full m-2 transition-all duration-150 animate-pulse`};

        ${({ $status }) =>
            !$status || $status === 'offline'
                ? tw`bg-red-500`
                : $status === 'running'
                ? tw`bg-green-500`
                : tw`bg-yellow-500`};
    }

    &:hover .status-bar {
        ${tw`opacity-75`};
    }
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

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

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
    }

    return (
        <StatusIndicatorBox
            as={Link}
            to={`/server/${server.id}`}
            className={className}
            $status={stats?.status}
            $bg={server.bg}
        >
            <div css={tw`hidden col-span-12 w-full sm:flex items-baseline justify-center items-center text-center`}>
                <div>
                    <p css={tw`text-xl font-medium break-words m-2 text-gray-200`}>{server.name}</p>
                    <p css={tw`text-sm text-neutral-400 break-words line-clamp-1 mb-2`}>
                        {server.allocations
                            .filter((alloc) => alloc.isDefault)
                            .map((allocation) => (
                                <React.Fragment key={allocation.ip + allocation.port.toString()}>
                                    {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                </React.Fragment>
                            ))}
                    </p>
                </div>
                {!stats ||
                    (isSuspended &&
                        (isSuspended ? (
                            <div css={tw`flex-1 text-center`}>
                                <span css={tw`bg-red-500 rounded px-2 py-1 text-red-100 text-xs`}>
                                    {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                                </span>
                            </div>
                        ) : server.isTransferring || server.status ? (
                            <div css={tw`flex-1 text-center`}>
                                <span css={tw`bg-neutral-500 rounded px-2 py-1 text-neutral-100 text-xs`}>
                                    {server.isTransferring
                                        ? 'Transferring'
                                        : server.status === 'installing'
                                        ? 'Installing'
                                        : server.status === 'restoring_backup'
                                        ? 'Restoring Backup'
                                        : 'Unavailable'}
                                </span>
                            </div>
                        ) : (
                            <Spinner size={'small'} />
                        )))}
            </div>
            {stats && (
                <div css={tw`hidden col-span-12 sm:flex items-baseline justify-center items-center`}>
                    <React.Fragment>
                        <div css={tw`flex-1 sm:block hidden`}>
                            <div css={tw`flex justify-center text-neutral-500`}>
                                <Icon.Cpu size={20} />
                                <IconDescription $alarm={alarms.cpu}>
                                    {stats.cpuUsagePercent.toFixed(2)}%
                                </IconDescription>
                            </div>
                        </div>
                        <div css={tw`flex-1 sm:block hidden`}>
                            <div css={tw`flex justify-center text-gray-500`}>
                                <Icon.PieChart size={20} />
                                <IconDescription $alarm={alarms.memory}>
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </IconDescription>
                            </div>
                        </div>
                        <div css={tw`flex-1 sm:block hidden`}>
                            <div css={tw`flex justify-center text-gray-500`}>
                                <Icon.HardDrive size={20} />
                                <IconDescription>{bytesToString(stats?.diskUsageInBytes)}</IconDescription>
                            </div>
                        </div>
                    </React.Fragment>
                </div>
            )}
            <div className={'status-bar'} />
        </StatusIndicatorBox>
    );
};
