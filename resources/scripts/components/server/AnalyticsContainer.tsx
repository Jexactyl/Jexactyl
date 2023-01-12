import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { Alert } from '@/components/elements/alert';
import ContentBox from '@/components/elements/ContentBox';
import { getMessages, Message } from '@/api/server/analytics';
import StatGraphs from '@/components/server/console/StatGraphs';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

interface Stats {
    memory: number;
    cpu: number;
    disk: number;
}

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
            className={'rotate-[-90deg] origin-[50%_50%] transition-[stroke-dashoffset] duration-300'}
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
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const cpuUsed = (stats.cpu / limits.cpu) * 100;
    const diskUsed = (stats.disk / 1024 / 1024 / limits.disk) * 100;
    const memoryUsed = (stats.memory / 1024 / 1024 / limits.memory) * 100;

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
        });
    };

    useEffect(() => {
        getMessages(uuid).then((data) => {
            setMessages(data);
            console.log(data);
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
        <ServerContentBlock title={'Analytics'} description={'View statistics for your server.'}>
            {status === ('offline' || null) ? (
                <p className={'text-center text-gray-400'}>Your server is offline.</p>
            ) : (
                <div className={'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-2'}>
                    <div className={'col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4'}>
                        <StatGraphs />
                    </div>
                    <div>
                        <ContentBox>
                            <UsageBox progress={cpuUsed} title={'CPU Usage'} content={`${cpuUsed.toFixed(2)}% used`} />
                            <UsageBox
                                progress={memoryUsed}
                                title={'Memory Usage'}
                                content={`${memoryUsed.toFixed(2)}% used`}
                            />
                            <UsageBox
                                progress={diskUsed}
                                title={'Disk Usage'}
                                content={`${diskUsed.toFixed(2)}% used`}
                            />
                        </ContentBox>
                        <TitledGreyBox title={'Performance Metrics'} className={'rounded mt-4'}>
                            {!messages ? (
                                <p className={'text-gray-400 text-center'}>No metrics are currently available.</p>
                            ) : (
                                <>
                                    {messages.slice(0, 2).map((message) => (
                                        <Alert type={message.type} key={message.id} className={'mb-2'}>
                                            <div>
                                                {message.title}
                                                <p className={'text-sm text-gray-400'}>{message.content}</p>
                                            </div>
                                        </Alert>
                                    ))}
                                </>
                            )}
                        </TitledGreyBox>
                    </div>
                </div>
            )}
        </ServerContentBlock>
    );
};
