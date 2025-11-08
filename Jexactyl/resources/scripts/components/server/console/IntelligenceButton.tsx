import stripAnsi from 'strip-ansi';
import { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Button } from '@/elements/button';
import { SparklesIcon } from '@heroicons/react/outline';
import { SocketEvent } from '@server/events';
import Dialog from '@/elements/dialog/Dialog';
import Spinner from '@/elements/Spinner';
import { handleQuery } from '@/api/routes/server/ai';
import { useStoreState } from '@/state/hooks';

type Visibility = 'none' | 'button' | 'dialog';

export default () => {
    const [log, setLog] = useState<string[]>([]);
    const [response, setResponse] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState<Visibility>('none');

    const isEnabled = useStoreState(state => state.everest.data!.ai.enabled);
    const status = ServerContext.useStoreState(state => state.status.value);
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { connected, instance } = ServerContext.useStoreState(state => state.socket);

    const submit = () => {
        setVisible('dialog');
        setLoading(true);
        const data = stripAnsi(log.map(it => it.replace('\r', '')).join('\n')) || '';

        handleQuery(uuid, data)
            .then(res => {
                setResponse(res);
                setLoading(false);
            })
            .catch(error => console.log(error));
    };

    useEffect(() => {
        if (!connected || !instance || status === 'running') return;

        const listener = (line: string) => {
            setLog(prevLog => [...prevLog, line.startsWith('>') ? line.substring(1) : line]);

            if (line.toLowerCase().indexOf('detected server process in a crashed state') >= 0) {
                setVisible('button');
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, listener);

        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, listener);
        };
    }, [connected, instance, status]);

    if (!isEnabled) return <></>;

    return visible === 'button' ? (
        <Button onClick={submit}>
            <SparklesIcon className={'w-5 mr-1'} /> Ask AI
        </Button>
    ) : visible === 'dialog' ? (
        <Dialog
            open={visible === 'dialog'}
            onClose={() => setVisible('none')}
            title={'Server Assistant'}
            preventExternalClose
        >
            {loading ? (
                <Spinner centered />
            ) : response ? (
                <div className={'overflow-x-hidden bg-black/50 rounded-lg p-3'}>{response}</div>
            ) : (
                'Error'
            )}
        </Dialog>
    ) : (
        <></>
    );
};
