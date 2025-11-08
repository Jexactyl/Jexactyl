// import { useServerFromRoute } from '@/api/routes/admin/server';
import DatabasesTable from '@admin/management/databases/DatabasesTable';

function ServerDatabases() {
    // const { data: server } = useServerFromRoute();
    // todo(jex): only show databases that this server is linked to!

    return <DatabasesTable />;
}

export default ServerDatabases;
