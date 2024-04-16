import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { Button } from '@/components/elements/button';
import ServerRowDialog from './ServerRowDialog';
import classNames from 'classnames';

export function statusToColor(state?: ServerPowerState): string {
    switch (state) {
        case 'running':
            return 'text-green-500';
        case 'starting' || 'stopping':
            return 'text-yellow-500';
        default:
            return 'text-red-500';
    }
}

type Timer = ReturnType<typeof setInterval>;

export default ({ index, server }: { index: number; server: Server }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');

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

    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';

    return (
        <>
            <tr className={classNames('bg-zinc-700/50 w-full', index % 5 === 0 && 'bg-black')}>
                <Link to={`/server/${server.id}`}>
                    <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {server.name}
                    </td>
                </Link>
                {!stats || stats.status === 'offline' ? (
                    <>
                        <td className="px-6 py-4 text-red-400 capitalize">{server.status ?? 'offline'}</td>
                        <td className="px-6 py-4">...</td>
                        <td className="px-6p y-4">...</td>
                    </>
                ) : (
                    <>
                        <td className="px-6 py-4 capitalize">
                            <span className={statusToColor(stats.status)}>{stats.status}</span>
                        </td>
                        <td className="px-6 py-4">{stats.cpuUsagePercent.toFixed(2)}%</td>
                        <td className="px-6 py-4">{`${bytesToString(stats.memoryUsageInBytes)} of ${memoryLimit}`}</td>
                    </>
                )}
                <Link to={`/server/${server.id}`}>
                    <Button size={Button.Sizes.Small} className={'mt-2'}>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Button>
                </Link>
                <Button.Text size={Button.Sizes.Small} className={'mt-2 ml-2'} onClick={() => setOpen(true)}>
                    <FontAwesomeIcon icon={faEllipsis} />
                </Button.Text>
            </tr>
            {open && <ServerRowDialog open={open} setOpen={setOpen} server={server} stats={stats} />}
        </>
    );
};
