import stripAnsi from 'strip-ansi';
import useFlash from '@/plugins/useFlash';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { SocketEvent } from '@/components/server/events';
import saveFileContents from '@/api/server/files/saveFileContents';

export default () => {
    const [log, setLog] = useState<string[]>([]);

    const { addFlash, clearFlashes } = useFlash();
    const status = ServerContext.useStoreState((state) => state.status.value);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);

    const addLog = (data: string) => {
        setLog((prevLog) => [...prevLog, data.startsWith('>') ? data.substring(1) : data]);
    };

    const submit = () => {
        clearFlashes('console:share');

        const data = stripAnsi(log.map((it) => it.replace('\r', '')).join('\n')) || '';

        saveFileContents(uuid, '/share/console-' + new Date().toLocaleTimeString() + '.txt', data)
            .then(() => {
                addFlash({
                    key: 'console:share',
                    type: 'success',
                    message: '您的服务器日志已保存到 /share 文件夹中。',
                });
            })
            .catch((error) => {
                addFlash({ key: 'console:share', type: 'error', message: httpErrorToHuman(error) });
            });
    };

    useEffect(() => {
        if (!connected || !instance) return;

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, addLog);

        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, addLog);
        };
    }, [connected, instance]);

    return (
        <>
            {status === 'offline' ? (
                <span className={'text-gray-400'}>离线</span>
            ) : (
                <div className={'cursor-pointer'} onClick={submit}>
                    保存
                </div>
            )}
        </>
    );
};
