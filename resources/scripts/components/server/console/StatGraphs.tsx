import { Line } from 'react-chartjs-2';
import { ServerContext } from '@/state/server';
import { bytesToString } from '@/lib/formatters';
import React, { useEffect, useRef } from 'react';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import ChartBlock from '@/components/server/console/ChartBlock';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2);
    const disk = useChartTickLabel('Disk', limits.disk, 'MiB');
    const memory = useChartTickLabel('Memory', limits.memory, 'MiB');
    const networkIn = useChart('Network In', {
        sets: 1,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts) {
            return {
                ...opts,
                label: 'Network In',
            };
        },
    });
    const networkOut = useChart('Network In', {
        sets: 1,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts) {
            return {
                ...opts,
                label: 'Network Out',
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            disk.clear();
            memory.clear();
            networkIn.clear();
            networkOut.clear();
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        cpu.push(values.cpu_absolute);
        disk.push(Math.floor(values.disk_bytes / 1024 / 1024));
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        networkIn.push(previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx));
        networkOut.push(previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx));

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
            <ChartBlock title={'CPU Load'}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Disk'}>
                <Line {...disk.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock title={'Network In'}>
                <Line {...networkIn.props} />
            </ChartBlock>
            <ChartBlock title={'Network Out'}>
                <Line {...networkOut.props} />
            </ChartBlock>
        </>
    );
};
