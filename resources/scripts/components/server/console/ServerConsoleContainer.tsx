import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import Features from '@feature/Features';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { Alert } from '@/components/elements/alert';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import FlashMessageRender from '@/components/FlashMessageRender';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);

    return (
        <ServerContentBlock title={'服务器控制台'}>
            {(isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isInstalling
                        ? '此服务器实例当前正在运行其安装过程，大多数操作都是不可用的。'
                        : '此服务器实例当前正在转移到另一个节点服务器，所有操作都不可用。'}
                </Alert>
            )}
            <FlashMessageRender byKey={'console:share'} className={'mb-2'} />
            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'j-left hidden sm:block sm:col-span-2 lg:col-span-3 pr-4'}>
                    <h1 className={'font-header text-2xl text-gray-50 leading-relaxed line-clamp-1'}>{name}</h1>
                    <p className={'text-sm line-clamp-2'}>{description}</p>
                </div>
                <div className={'flex-1'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'j-down flex sm:justify-end space-x-2'} />
                    </Can>
                </div>
            </div>
            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-8'}>
                <div className={'col-span-4 lg:col-span-3'}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
                <ServerDetailsBlock className={'j-left col-span-4 lg:col-span-1 order-last lg:order-none'} />
            </div>
            {status !== 'offline' && (
                <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            )}
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
