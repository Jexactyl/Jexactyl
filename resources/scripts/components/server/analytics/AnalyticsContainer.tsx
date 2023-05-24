import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { Alert } from '@/components/elements/alert';
import ContentBox from '@/components/elements/ContentBox';
import { getMessages, Message } from '@/api/server/analytics';
import StatGraphs from '@/components/server/console/StatGraphs';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import PowerButtons from '@/components/server/console/PowerButtons';
import UsageMetrics from '@/components/server/analytics/UsageMetrics';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime', number>;

const svgProps = {
    cx: 16,
    cy: 16,
    r: 14,
    strokeWidth: 3,
    fill: 'none',
    stroke: 'currentColor',
};

const ProgressCircle = ({ data }: { data: number }) => (
    <svg viewBox={'0 0 32 32'} className={'w-16 h-16'}>
        <circle {...svgProps} className={'opacity-50'} />
        <circle
            {...svgProps}
            stroke={data >= 95 ? '#ef4444' : data >= 75 ? '#eab308' : '#22C55E'}
            strokeDasharray={28 * Math.PI}
            className={'rotate-[-90deg] origin-[50%_50%] transition-[stroke-dashoffset] duration-1000'}
            style={{ strokeDashoffset: ((100 - data) / 100) * 28 * Math.PI }}
        />
    </svg>
);

const UsageBox = ({ progress, title, content }: { progress: number; title: string; content: string }) => (
    <div className={'grid grid-cols-1 lg:grid-cols-5 gap-2 sm:gap-4 p-6'}>
        <ProgressCircle data={progress} />
        <div className={'col-span-4 inline-block align-text-middle'}>
            <p className={'text-2xl text-gray-200'}>{title}</p>
            <p className={'text-lg text-gray-400'}>{content}</p>
        </div>
    </div>
);

export default () => {
    const [messages, setMessages] = useState<Message[]>();
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0 });

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const cpuUsed = ((stats.cpu / limits.cpu) * 100).toFixed(2);
    const diskUsed = ((stats.disk / 1024 / 1024 / limits.disk) * 100).toFixed(2);
    const memoryUsed = ((stats.memory / 1024 / 1024 / limits.memory) * 100).toFixed(2);

    const statsListener = (data: string) => {
        let stats: any = {};

        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            uptime: stats.uptime || 0,
        });
    };

    useEffect(() => {
        getMessages(uuid).then((data) => {
            setMessages(data);
        });

        if (!connected || !instance) {
            return;
        }

        instance.addListener(SocketEvent.STATS, statsListener);
        instance.send(SocketRequest.SEND_STATS);

        return () => {
            instance.removeListener(SocketEvent.STATS, statsListener);
        };
    }, [instance, connected]);

    return (
        <ServerContentBlock title={'Server Analytics'} description={'View statistics and performance for your server.'}>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-2'}>
                <div className={'col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4'}>
                    <UsageMetrics />
                    <StatGraphs />
                </div>
                <div className={'lg:ml-2'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex space-x-4 text-center mb-4'} />
                    </Can>
                    <ContentBox>
                        <UsageBox progress={parseInt(cpuUsed)} title={'CPU Usage'} content={`${cpuUsed}% used`} />
                        <UsageBox
                            progress={parseInt(memoryUsed)}
                            title={'Memory Usage'}
                            content={`${memoryUsed}% used`}
                        />
                        <UsageBox progress={parseInt(diskUsed)} title={'Disk Usage'} content={`${diskUsed}% used`} />
                    </ContentBox>
                    <TitledGreyBox title={'Performance Metrics'} className={'rounded mt-4'}>
                        {!messages || messages.length < 1 ? (
                            <p className={'text-gray-400 text-center'}>No metrics are currently available.</p>
                        ) : (
                            <>
                                {messages.slice(0, 6).map((message) => (
                                    <Alert type={message.type} key={message.id} className={'mb-2'}>
                                        <div>
                                            {message.title}{' '}
                                            <span className={'text-xs text-gray-400'}>({message.createdAt})</span>
                                            <p className={'text-sm text-gray-400'}>{message.content}</p>
                                        </div>
                                    </Alert>
                                ))}
                            </>
                        )}
                    </TitledGreyBox>
                </div>
            </div>
        </ServerContentBlock>
    );
};
