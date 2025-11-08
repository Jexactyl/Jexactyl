import { lazy } from 'react';
import * as Icon from '@heroicons/react/outline';
import { route, type AdminRouteDefinition } from '@/routers/routes/utils';

const OverviewContainer = lazy(() => import('@/components/admin/general/overview/OverviewContainer'));
const SettingsRouter = lazy(() => import('@/components/admin/general/settings/SettingsRouter'));
const ActivityContainer = lazy(() => import('@/components/admin/general/ActivityContainer'));
const ApplicationApiRouter = lazy(() => import('@/components/admin/general/api/ApplicationApiRouter'));

const AuthContainer = lazy(() => import('@/components/admin/modules/auth/AuthContainer'));
const BillingRouter = lazy(() => import('@/components/admin/modules/billing/BillingRouter'));
const TicketRouter = lazy(() => import('@/components/admin/modules/tickets/TicketRouter'));
const AIRouter = lazy(() => import('@/components/admin/modules/ai/AIRouter'));
const WebhookRouter = lazy(() => import('@/components/admin/modules/webhooks/WebhookRouter'));
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
const RolesContainer = lazy(() => import('@/components/admin/management/roles/RolesContainer'));
const RoleEditContainer = lazy(() => import('@/components/admin/management/roles/RoleEditContainer'));

const NestsContainer = lazy(() => import('@/components/admin/service/nests/NestsContainer'));
const NestEditContainer = lazy(() => import('@/components/admin/service/nests/NestEditContainer'));
const NewEggContainer = lazy(() => import('@/components/admin/service/nests/NewEggContainer'));
const EggRouter = lazy(() => import('@/components/admin/service/nests/eggs/EggRouter'));

const admin: AdminRouteDefinition[] = [
    /**
     * Admin - General Routes
     */
    route('', OverviewContainer, { name: 'Overview', end: true, icon: Icon.OfficeBuildingIcon, category: 'general' }),
    route('settings/*', SettingsRouter, { name: 'Settings', icon: Icon.CogIcon, category: 'general' }),
    route('activity', ActivityContainer, {
        name: 'Activity',
        icon: Icon.EyeIcon,
        category: 'general',
        condition: flags => flags.activityEnabled,
    }),
    route('api/*', ApplicationApiRouter, { name: 'API', icon: Icon.CodeIcon, category: 'general', advanced: true }),

    /**
     * Admin - Module Routes
     */
    route('auth', AuthContainer, { name: 'Auth', icon: Icon.KeyIcon, category: 'modules', advanced: true }),
    route('billing/*', BillingRouter, { name: 'Billing', icon: Icon.CashIcon, category: 'modules', advanced: true }),
    route('tickets/*', TicketRouter, { name: 'Tickets', icon: Icon.TicketIcon, category: 'modules', advanced: true }),
    route('ai/*', AIRouter, { name: 'AI', icon: Icon.SparklesIcon, category: 'modules', advanced: true }),
    route('webhooks/*', WebhookRouter, {
        name: 'Webhooks',
        icon: Icon.CursorClickIcon,
        category: 'modules',
        advanced: true,
    }),

    /**
     * Admin - Appearance Routes
     */
    route('theme', ThemeContainer, { name: 'Theme', icon: Icon.PencilAltIcon, category: 'appearance' }),
    route('links/*', LinksContainer, { name: 'Links', icon: Icon.LinkIcon, category: 'appearance' }),
    route('alerts/*', AlertRouter, { name: 'Alerts', icon: Icon.ShieldExclamationIcon, category: 'appearance' }),

    /**
     * Admin - Management Routes
     */
    route('databases', DatabasesContainer, {
        name: 'Databases',
        icon: Icon.DatabaseIcon,
        category: 'management',
        advanced: true,
    }),
    route('databases/:id', DatabaseEditContainer),
    route('nodes/*', NodesContainer, { name: 'Nodes', icon: Icon.ServerIcon, category: 'management' }),
    route('nodes/new', NewNodeContainer),
    route('nodes/:id/*', NodeRouter),
    route('servers', ServersContainer, { name: 'Servers', icon: Icon.TerminalIcon, category: 'management' }),
    route('servers/new', NewServerContainer),
    route('servers/:id/*', ServerRouter),
    route('users', AdminUsersContainer, { name: 'Users', icon: Icon.UserIcon, category: 'management' }),
    route('users/new', NewUserContainer),
    route('users/:id/*', UserRouter),
    route('roles', RolesContainer, { name: 'Roles', icon: Icon.UserGroupIcon, category: 'management' }),
    route('roles/:id', RoleEditContainer),

    /**
     * Admin - Service Routes
     */
    route('nests', NestsContainer, { name: 'Nests', icon: Icon.ViewGridIcon, category: 'services' }),
    route('nests/:nestId', NestEditContainer),
    route('nests/:nestId/new', NewEggContainer),
    route('nests/:nestId/eggs/:id/*', EggRouter),
];

export default admin;
