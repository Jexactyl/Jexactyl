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

const StatusIndicatorBox = styled(GreyRowBox)<{ $status: ServerPowerState | undefined; $bg: string }>`
    ${tw`relative overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 transition-all duration-300`};
    ${tw`hover:border-neutral-600 hover:shadow-2xl`};

    ${({ $bg }) => $bg && `background-image: url("${$bg}");`}
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    /* Overlay for better text readability */
    &::before {
        content: '';
        ${tw`absolute inset-0 bg-neutral-900 opacity-95`};
        background: linear-gradient(to bottom right, rgba(23, 25, 35, 0.95), rgba(38, 38, 38, 0.95));
        backdrop-filter: blur(4px);
        z-index: 1;
    }

    /* Content wrapper */
    & > * {
        position: relative;
        z-index: 2;
    }

    & .status-bar {
        ${tw`w-3 h-3 absolute right-3 top-3 z-30 rounded-full transition-all duration-150`};
        box-shadow: 0 0 10px currentColor;

        ${({ $status }) =>
            !$status || $status === 'offline'
                ? tw`bg-red-500 animate-pulse`
                : $status === 'running'
                ? tw`bg-green-500`
                : tw`bg-yellow-500 animate-pulse`};
    }

    &:hover .status-bar {
        ${tw`scale-125`};
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
            <div css={tw`p-6`}>
                {/* Server Name and Address */}
                <div css={tw`mb-4`}>
                    <h3 css={tw`text-xl font-bold text-white mb-1 truncate`}>{server.name}</h3>
                    <p css={tw`text-sm text-neutral-400`}>
                        {server.allocations
                            .filter((alloc) => alloc.isDefault)
                            .map((allocation) => (
                                <span key={allocation.ip + allocation.port.toString()}>
                                    {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                </span>
                            ))}
                    </p>
                </div>

                {/* Status Badge */}
                {(!stats || isSuspended) && (
                    <div css={tw`mb-4`}>
                        {isSuspended ? (
                            <span
                                css={tw`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-red-400 border`}
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                }}
                            >
                                {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                            </span>
                        ) : server.isTransferring || server.status ? (
                            <span
                                css={tw`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-400 border`}
                                style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                {server.isTransferring
                                    ? 'Transferring'
                                    : server.status === 'installing'
                                    ? 'Installing'
                                    : server.status === 'restoring_backup'
                                    ? 'Restoring Backup'
                                    : 'Unavailable'}
                            </span>
                        ) : (
                            <Spinner size={'small'} />
                        )}
                    </div>
                )}

                {/* Resource Stats */}
                {stats && (
                    <div css={tw`grid grid-cols-3 gap-3`}>
                        <div
                            css={tw`rounded-lg p-3 border`}
                            style={{
                                backgroundColor: 'rgba(23, 23, 23, 0.5)',
                                borderColor: 'rgba(64, 64, 64, 0.5)',
                            }}
                        >
                            <div css={tw`flex items-center gap-2 mb-1`}>
                                <Icon.Cpu size={16} css={tw`text-blue-400`} />
                                <span css={tw`text-xs text-neutral-400`}>CPU</span>
                            </div>
                            <p css={alarms.cpu ? tw`text-red-400 font-semibold` : tw`text-white font-semibold`}>
                                {stats.cpuUsagePercent.toFixed(0)}%
                            </p>
                        </div>
                        <div
                            css={tw`rounded-lg p-3 border`}
                            style={{
                                backgroundColor: 'rgba(23, 23, 23, 0.5)',
                                borderColor: 'rgba(64, 64, 64, 0.5)',
                            }}
                        >
                            <div css={tw`flex items-center gap-2 mb-1`}>
                                <Icon.PieChart size={16} css={tw`text-purple-400`} />
                                <span css={tw`text-xs text-neutral-400`}>RAM</span>
                            </div>
                            <p css={alarms.memory ? tw`text-red-400 font-semibold` : tw`text-white font-semibold`}>
                                {bytesToString(stats.memoryUsageInBytes)}
                            </p>
                        </div>
                        <div
                            css={tw`rounded-lg p-3 border`}
                            style={{
                                backgroundColor: 'rgba(23, 23, 23, 0.5)',
                                borderColor: 'rgba(64, 64, 64, 0.5)',
                            }}
                        >
                            <div css={tw`flex items-center gap-2 mb-1`}>
                                <Icon.HardDrive size={16} css={tw`text-green-400`} />
                                <span css={tw`text-xs text-neutral-400`}>Disk</span>
                            </div>
                            <p css={tw`text-white font-semibold`}>{bytesToString(stats.diskUsageInBytes)}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className={'status-bar'} />
        </StatusIndicatorBox>
    );
};
