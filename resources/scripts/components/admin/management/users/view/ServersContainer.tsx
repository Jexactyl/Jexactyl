import ServersTable from '@admin/management/servers/ServersTable';
import { Context } from '@admin/management/users/UserRouter';

function UserServers() {
    const user = Context.useStoreState(state => state.user);

    return <ServersTable filters={{ owner_id: user?.id?.toString?.() }} />;
}

export default UserServers;
