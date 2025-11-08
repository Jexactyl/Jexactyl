import { lazy } from 'react';
import * as Icon from '@heroicons/react/outline';
import { route, type RouteDefinition } from '@/routers/routes/utils';

const AccountApiContainer = lazy(() => import('@account/AccountApiContainer'));
const AccountSSHContainer = lazy(() => import('@account/ssh/AccountSSHContainer'));
const AccountOverviewContainer = lazy(() => import('@account/AccountOverviewContainer'));

const TicketContainer = lazy(() => import('@account/tickets/TicketContainer'));
const ViewTicketContainer = lazy(() => import('@account/tickets/view/ViewTicketContainer'));

const ProductsContainer = lazy(() => import('@account/billing/ProductsContainer'));
const OrderContainer = lazy(() => import('@account/billing/order/OrderContainer'));
const OrdersContainer = lazy(() => import('@account/billing/orders/OrdersContainer'));
const Processing = lazy(() => import('@account/billing/order/summary/Processing'));
const Success = lazy(() => import('@account/billing/order/summary/Success'));
const Cancel = lazy(() => import('@account/billing/order/summary/Cancel'));

const account: RouteDefinition[] = [
    /**
     * Account - General Routes
     */
    route('', AccountOverviewContainer, { name: 'Account', end: true, icon: Icon.UserIcon }),
    route('api', AccountApiContainer, { name: 'API Credentials', icon: Icon.CodeIcon }),
    route('ssh', AccountSSHContainer, { name: 'SSH Keys', icon: Icon.TerminalIcon }),

    /**
     * Account - Ticket Routes
     */
    route('tickets', TicketContainer, {
        name: 'Tickets',
        icon: Icon.TicketIcon,
        condition: flags => flags.tickets.enabled,
    }),
    route('tickets/:id', ViewTicketContainer, { condition: flags => flags.tickets.enabled }),

    /**
     * Account - Billing Routes
     */
    route('billing/order', ProductsContainer, {
        name: 'Billing',
        icon: Icon.CashIcon,
        condition: flags => flags.billing.enabled,
    }),
    route('billing/order/:id', OrderContainer),
    route('billing/orders', OrdersContainer, {
        name: 'Orders',
        icon: Icon.ClipboardListIcon,
        condition: flags => flags.billing.enabled,
    }),
    route('billing/processing', Processing),
    route('billing/success', Success),
    route('billing/cancel', Cancel),
];

export default account;
