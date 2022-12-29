import React from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);

    return (
        <ServerContentBlock title={'Analytics'} description={'View statistics for your server.'}>
            {status === 'offline' ? (
                <p className={'my-10 text-center text-gray-400'}>Your server is offline.</p>
            ) : (
                <p className={'my-10 text-center text-gray-400'}>Placeholder</p>
            )}
        </ServerContentBlock>
    );
};
