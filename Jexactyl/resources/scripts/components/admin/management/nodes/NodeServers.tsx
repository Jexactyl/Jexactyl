import { Context } from '@admin/management/nodes/NodeRouter';
import ServersTable from '@admin/management/servers/ServersTable';

function NodeServers() {
    const node = Context.useStoreState(state => state.node);

    return <ServersTable filters={{ node_id: node?.id?.toString() }} />;
}

export default NodeServers;
