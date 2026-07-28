import { lazy } from 'react';
import * as Icon from '@heroicons/react/outline';
import { route, type AdminRouteDefinition } from '@/routers/routes/utils';

import ServerPresetContainer from '@/components/admin/management/servers/presets/ServerPresetContainer';
import ServerPresetViewContainer from '@/components/admin/management/servers/presets/ServerPresetViewContainer';
// todo(jex): lazy load these

const OverviewContainer = lazy(() => import('@/components/admin/general/overview/OverviewContainer'));
const ActivityLogsContainer = lazy(() => import('@/components/admin/general/activity/ActivityLogsContainer'));
const SettingsRouter = lazy(() => import('@/components/admin/general/settings/SettingsRouter'));
const ApplicationApiRouter = lazy(() => import('@/components/admin/general/api/ApplicationApiRouter'));

const AuthContainer = lazy(() => import('@/components/admin/modules/auth/AuthContainer'));
const BillingRouter = lazy(() => import('@/components/admin/modules/billing/BillingRouter'));
const TicketRouter = lazy(() => import('@/components/admin/modules/tickets/TicketRouter'));
const AIRouter = lazy(() => import('@/components/admin/modules/ai/AIRouter'));
const WebhookRouter = lazy(() => import('@/components/admin/general/settings/webhooks/WebhookRouter'));
const ThemeContainer = lazy(() => import('@/components/admin/modules/theme/ThemeContainer'));
const AlertRouter = lazy(() => import('@/components/admin/modules/alert/AlertRouter'));

const NodeRouter = lazy(() => import('@/components/admin/management/nodes/NodeRouter'));
const NodesContainer = lazy(() => import('@/components/admin/management/nodes/NodesContainer'));
const NewNodeContainer = lazy(() => import('@/components/admin/management/nodes/NewNodeContainer'));

const DatabaseEditContainer = lazy(() => import('@/components/admin/management/databases/DatabaseEditContainer'));
const DatabasesContainer = lazy(() => import('@/components/admin/management/databases/DatabasesContainer'));

const LinksContainer = lazy(() => import('@/components/admin/modules/links/LinksContainer'));

const ServersContainer = lazy(() => import('@/components/admin/management/servers/ServersContainer'));
const NewServerContainer = lazy(() => import('@/components/admin/management/servers/NewServerContainer'));
const ServerRouter = lazy(() => import('@/components/admin/management/servers/ServerRouter'));

const AdminUsersContainer = lazy(() => import('@/components/admin/management/users/UsersContainer'));
const NewUserContainer = lazy(() => import('@/components/admin/management/users/NewUserContainer'));
const UserRouter = lazy(() => import('@/components/admin/management/users/UserRouter'));
const RolesContainer = lazy(() => import('@/components/admin/management/users/roles/RolesContainer'));
const RoleEditContainer = lazy(() => import('@/components/admin/management/users/roles/RoleEditContainer'));

const NestsContainer = lazy(() => import('@/components/admin/service/nests/NestsContainer'));
const NestEditContainer = lazy(() => import('@/components/admin/service/nests/NestEditContainer'));
const NewEggContainer = lazy(() => import('@/components/admin/service/nests/NewEggContainer'));
const EggRouter = lazy(() => import('@/components/admin/service/nests/eggs/EggRouter'));

const admin: AdminRouteDefinition[] = [
    /**
     * Admin - General Routes
     */
    route('', OverviewContainer, {
        name: 'Overview',
        end: true,
        icon: Icon.OfficeBuildingIcon,
        category: 'general',
        permission: 'overview.read',
    }),
    route('activity', ActivityLogsContainer, {
        name: 'Activity',
        icon: Icon.ClipboardListIcon,
        category: 'general',
        permission: 'activity.read',
        condition: ({ activityEnabled }: { activityEnabled: boolean }) => activityEnabled,
    }),
    route('settings/*', SettingsRouter, {
        name: 'Settings',
        icon: Icon.CogIcon,
        category: 'general',
        permission: 'settings.read',
    }),
    route('settings/webhooks/*', WebhookRouter, { permission: 'webhooks.read' }),
    route('api/*', ApplicationApiRouter, {
        name: 'API',
        icon: Icon.CodeIcon,
        category: 'general',
        advanced: true,
        permission: 'api.read',
    }),

    /**
     * Admin - Module Routes
     */
    route('auth', AuthContainer, {
        name: 'Auth',
        icon: Icon.KeyIcon,
        category: 'modules',
        advanced: true,
        permission: 'auth.read',
    }),
    route('billing/*', BillingRouter, {
        name: 'Billing',
        icon: Icon.CashIcon,
        category: 'modules',
        advanced: true,
        permission: 'billing.read',
    }),
    route('tickets/*', TicketRouter, {
        name: 'Tickets',
        icon: Icon.TicketIcon,
        category: 'modules',
        advanced: true,
        permission: 'tickets.read',
    }),
    route('ai/*', AIRouter, {
        name: 'AI',
        icon: Icon.SparklesIcon,
        category: 'modules',
        advanced: true,
        permission: 'ai.read',
    }),

    /**
     * Admin - Appearance Routes
     */
    route('theme', ThemeContainer, {
        name: 'Theme',
        icon: Icon.PencilAltIcon,
        category: 'appearance',
        permission: 'theme.read',
    }),
    route('links/*', LinksContainer, {
        name: 'Links',
        icon: Icon.LinkIcon,
        category: 'appearance',
        permission: 'links.read',
    }),
    route('alerts/*', AlertRouter, {
        name: 'Alerts',
        icon: Icon.ShieldExclamationIcon,
        category: 'appearance',
        permission: 'alerts.read',
    }),

    /**
     * Admin - Management Routes
     */
    route('databases', DatabasesContainer, {
        name: 'Databases',
        icon: Icon.DatabaseIcon,
        category: 'management',
        advanced: true,
        permission: 'databases.read',
    }),
    route('databases/:id', DatabaseEditContainer, { permission: 'databases.read' }),
    route('nodes/*', NodesContainer, {
        name: 'Nodes',
        icon: Icon.ServerIcon,
        category: 'management',
        permission: 'nodes.read',
    }),
    route('nodes/new', NewNodeContainer, { permission: 'nodes.create' }),
    route('nodes/:id/*', NodeRouter, { permission: 'nodes.read' }),

    route('servers', ServersContainer, {
        name: 'Servers',
        icon: Icon.TerminalIcon,
        category: 'management',
        permission: 'servers.read',
    }),
    route('servers/new', NewServerContainer, { permission: 'servers.create' }),
    route('servers/presets', ServerPresetContainer, { permission: 'server-presets.read' }),
    route('servers/presets/:id/*', ServerPresetViewContainer, { permission: 'server-presets.read' }),
    route('servers/:id/*', ServerRouter, { permission: 'servers.read' }),

    route('users', AdminUsersContainer, {
        name: 'Users',
        icon: Icon.UserIcon,
        category: 'management',
        permission: 'users.read',
    }),
    route('users/new', NewUserContainer, { permission: 'users.create' }),
    route('users/:id/*', UserRouter, { permission: 'users.read' }),
    route('users/roles', RolesContainer, { permission: 'roles.read' }),
    route('users/roles/:id', RoleEditContainer, { permission: 'roles.read' }),

    /**
     * Admin - Service Routes
     */
    route('nests', NestsContainer, { permission: 'nests.read' }),
    route('nests/:nestId', NestEditContainer, { permission: 'nests.read' }),
    route('nests/:nestId/new', NewEggContainer, { permission: 'eggs.create' }),
    route('nests/:nestId/eggs/:id/*', EggRouter, { permission: 'eggs.read' }),
];

export default admin;
