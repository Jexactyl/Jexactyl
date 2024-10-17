import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { Alert } from '@elements/alert';
import Can from '@elements/Can';
import ServerContentBlock from '@elements/ServerContentBlock';
import Spinner from '@elements/Spinner';
import Console from '@/components/server/console/Console';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import StatGraphs from '@/components/server/console/StatGraphs';
import Features from '@feature/Features';
import { ServerContext } from '@/state/server';
import classNames from 'classnames';
import { usePersistedState } from '@/plugins/usePersistedState';
import { useStoreState } from '@/state/hooks';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

function ServerConsoleContainer() {
    const user = useStoreState(state => state.user.data!);
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const name = ServerContext.useStoreState(state => state.server.data!.name);
    const description = ServerContext.useStoreState(state => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState(state => state.server.isInstalling);
    const [expand, setExpand] = usePersistedState<boolean>(`console_expand_${user.uuid}`, false);
    const isTransferring = ServerContext.useStoreState(state => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState(state => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState(state => state.server.data!.isNodeUnderMaintenance);

    return (
        <ServerContentBlock title={'Console'} showFlashKey={'console:share'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}
            <div className={'mb-4 grid grid-cols-4 gap-4'}>
                <div className={'hidden pr-4 sm:col-span-2 sm:block lg:col-span-3'}>
                    <h1 className={'font-header text-2xl leading-relaxed text-slate-50 line-clamp-1'}>{name}</h1>
                    <p className={'text-sm line-clamp-2'}>{description ?? uuid}</p>
                </div>
                <div className={'col-span-4 self-end sm:col-span-2 lg:col-span-1'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex space-x-2 sm:justify-end'} />
                    </Can>
                </div>
            </div>
            {!expand && <ServerDetailsBlock className={'order-last col-span-4 lg:order-none lg:col-span-1'} />}
            <div className={'mb-4 grid grid-cols-4 gap-2 sm:gap-4'}>
                <div className={classNames('col-span-4 flex', !expand && 'lg:col-span-3')}>
                    <Spinner.Suspense>
                        <Console expand={expand} setExpand={setExpand} />
                    </Spinner.Suspense>
                </div>
                {!expand && (
                    <div className={'col-span-4 lg:col-span-1 my-auto'}>
                        <div className={'grid grid-cols-1 gap-2'}>
                            <Spinner.Suspense>
                                <StatGraphs />
                            </Spinner.Suspense>
                        </div>
                    </div>
                )}
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
}

export default memo(ServerConsoleContainer, isEqual);
