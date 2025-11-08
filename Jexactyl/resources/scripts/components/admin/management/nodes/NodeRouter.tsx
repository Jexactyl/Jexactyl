import type { Action, Actions } from 'easy-peasy';
import { action, createContextStore, useStoreActions } from 'easy-peasy';
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import type { Node } from '@/api/routes/admin/nodes/getNodes';
import getNode from '@/api/routes/admin/nodes/getNode';
import FlashMessageRender from '@/elements/FlashMessageRender';
import AdminContentBlock from '@/elements/AdminContentBlock';
import NodeEditContainer from '@admin/management/nodes/NodeEditContainer';
import Spinner from '@/elements/Spinner';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import NodeAboutContainer from '@admin/management/nodes/NodeAboutContainer';
import NodeConfigurationContainer from '@admin/management/nodes/NodeConfigurationContainer';
import NodeAllocationContainer from '@admin/management/nodes/NodeAllocationContainer';
import NodeServers from '@admin/management/nodes/NodeServers';
import type { ApplicationStore } from '@/state';
import { useStoreState } from '@/state/hooks';
import NodeStatus from './NodeStatus';
import { CodeIcon, OfficeBuildingIcon, ServerIcon, WifiIcon } from '@heroicons/react/outline';
import { CogIcon } from '@heroicons/react/solid';

interface ctx {
    node: Node | undefined;
    setNode: Action<ctx, Node | undefined>;
}

export const Context = createContextStore<ctx>({
    node: undefined,

    setNode: action((state, payload) => {
        state.node = payload;
    }),
});

const NodeRouter = () => {
    const params = useParams<'id'>();

    const theme = useStoreState(state => state.theme.data!);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const [loading, setLoading] = useState(true);

    const node = Context.useStoreState(state => state.node);
    const setNode = Context.useStoreActions(actions => actions.setNode);

    useEffect(() => {
        clearFlashes('admin:nodes');

        getNode(Number(params.id), ['database_host'])
            .then(node => setNode(node))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'admin:nodes', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || node === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'admin:nodes'} css={tw`mb-4`} />

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'} />
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Node - ' + node.name}>
            <div css={tw`w-full flex flex-row items-center mb-4`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>
                        {node.name}
                        <NodeStatus node={node.id} className={'ml-2 mb-0.5'} />
                    </h2>
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        {node.uuid}
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'admin:nodes'} css={tw`mb-4`} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to={`/admin/nodes/${node.id}`} name={'About'} base>
                    <OfficeBuildingIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/nodes/${node.id}/settings`} name={'Settings'}>
                    <CogIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/nodes/${node.id}/configuration`} name={'Configuration'}>
                    <CodeIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/nodes/${node.id}/allocations`} name={'Allocations'}>
                    <WifiIcon />
                </SubNavigationLink>

                <SubNavigationLink to={`/admin/nodes/${node.id}/servers`} name={'Servers'}>
                    <ServerIcon />
                </SubNavigationLink>
            </SubNavigation>

            <Routes>
                <Route path="" element={<NodeAboutContainer />} />
                <Route path="settings" element={<NodeEditContainer />} />
                <Route path="configuration" element={<NodeConfigurationContainer />} />
                <Route path="allocations" element={<NodeAllocationContainer />} />
                <Route path="servers" element={<NodeServers />} />
            </Routes>
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <NodeRouter />
        </Context.Provider>
    );
};
