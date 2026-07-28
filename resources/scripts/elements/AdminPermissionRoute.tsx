import type { ReactNode } from 'react';
import { useStoreState } from 'easy-peasy';

import { ServerError } from '@/elements/ScreenBlock';
import { hasAdminPermission } from '@/plugins/adminPermissions';

interface Props {
    children?: ReactNode;

    permission?: string | string[];
}

function AdminPermissionRoute({ children, permission }: Props): JSX.Element {
    const adminPermissions = useStoreState(state => state.user.data!.adminPermissions);

    if (hasAdminPermission(adminPermissions, permission)) {
        return <>{children}</>;
    }

    return <ServerError title="Access Denied" message="You do not have permission to access this page." />;
}

export default AdminPermissionRoute;
