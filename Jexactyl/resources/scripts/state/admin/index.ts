import { createContextStore } from 'easy-peasy';

import type { AdminAllocationStore } from '@/state/admin/allocations';
import allocations from '@/state/admin/allocations';
import type { AdminDatabaseStore } from '@/state/admin/databases';
import databases from '@/state/admin/databases';
import type { AdminMountStore } from '@/state/admin/mounts';
import mounts from '@/state/admin/mounts';
import type { AdminNestStore } from '@/state/admin/nests';
import nests from '@/state/admin/nests';
import type { AdminNodeStore } from '@/state/admin/nodes';
import nodes from '@/state/admin/nodes';
import type { AdminRoleStore } from '@/state/admin/roles';
import roles from '@/state/admin/roles';
import type { AdminServerStore } from '@/state/admin/servers';
import servers from '@/state/admin/servers';
import type { AdminUserStore } from '@/state/admin/users';
import users from '@/state/admin/users';
import type { AdminApiStore } from '@/state/admin/api';
import api from '@/state/admin/api';
import { AdminTicketStore } from '@/state/admin/tickets';
import tickets from '@/state/admin/tickets';

interface AdminStore {
    allocations: AdminAllocationStore;
    api: AdminApiStore;
    databases: AdminDatabaseStore;
    mounts: AdminMountStore;
    nests: AdminNestStore;
    nodes: AdminNodeStore;
    roles: AdminRoleStore;
    servers: AdminServerStore;
    users: AdminUserStore;
    tickets: AdminTicketStore;
}

export const AdminContext = createContextStore<AdminStore>({
    allocations,
    api,
    databases,
    mounts,
    nests,
    nodes,
    roles,
    servers,
    users,
    tickets,
});
