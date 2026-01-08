import { lazy } from 'react';
import * as Icon from '@heroicons/react/outline';
import { route, type ServerRouteDefinition } from '@/routers/routes/utils';

const ServerConsoleContainer = lazy(() => import('@server/console/ServerConsoleContainer'));
const FileManagerContainer = lazy(() => import('@server/files/FileManagerContainer'));
const FileEditContainer = lazy(() => import('@server/files/FileEditContainer'));
const DatabasesContainer = lazy(() => import('@server/databases/DatabasesContainer'));
const ScheduleContainer = lazy(() => import('@server/schedules/ScheduleContainer'));
const ScheduleEditContainer = lazy(() => import('@server/schedules/ScheduleEditContainer'));
const UsersContainer = lazy(() => import('@server/users/UsersContainer'));
const BackupContainer = lazy(() => import('@server/backups/BackupContainer'));
const NetworkContainer = lazy(() => import('@server/network/NetworkContainer'));
const StartupContainer = lazy(() => import('@server/startup/StartupContainer'));
const ServerActivityLogContainer = lazy(() => import('@server/ServerActivityLogContainer'));
const ServerBillingContainer = lazy(() => import('@server/billing/ServerBillingContainer'));

const server: ServerRouteDefinition[] = [
    route('', ServerConsoleContainer, {
        permission: 'control.console',
        name: 'Console',
        end: true,
        icon: Icon.TerminalIcon,
    }),
    route('files/*', FileManagerContainer, {
        permission: 'file.*',
        name: 'Files',
        icon: Icon.FolderOpenIcon,
        category: 'data',
    }),
    route('files/:action/*', FileEditContainer, { permission: 'file.*' }),
    route('databases/*', DatabasesContainer, {
        permission: 'database.*',
        name: 'Databases',
        icon: Icon.DatabaseIcon,
        category: 'data',
    }),
    route('schedules/*', ScheduleContainer, {
        permission: 'schedule.*',
        name: 'Schedules',
        icon: Icon.ClockIcon,
        category: 'configuration',
    }),
    route('schedules/:id/*', ScheduleEditContainer, { permission: 'schedule.*', category: 'configuration' }),
    route('users/*', UsersContainer, {
        permission: 'user.*',
        name: 'Users',
        icon: Icon.UsersIcon,
        category: 'configuration',
    }),
    route('backups/*', BackupContainer, {
        permission: 'backup.*',
        name: 'Backups',
        icon: Icon.ArchiveIcon,
        category: 'data',
    }),
    route('network/*', NetworkContainer, {
        permission: 'allocation.*',
        name: 'Network',
        icon: Icon.WifiIcon,
        category: 'configuration',
    }),
    route('startup/*', StartupContainer, {
        permission: 'startup.*',
        name: 'Startup',
        icon: Icon.PlayIcon,
        category: 'configuration',
    }),
    route('activity/*', ServerActivityLogContainer, {
        permission: 'activity.*',
        name: 'Activity',
        icon: Icon.EyeIcon,
        condition: flags => flags.activityEnabled,
    }),
    route('billing/*', ServerBillingContainer, {
        permission: 'billing.*',
        name: 'Billing',
        icon: Icon.CashIcon,
        condition: flags => flags.billable,
    }),
];

export default server;
