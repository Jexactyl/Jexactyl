import { lazy } from 'react';
import * as Icon from '@heroicons/react/outline';
import { redirectTo, route, type RouteDefinition } from '@/routers/routes/utils';

const SecurityRouter = lazy(() => import('@account/security/SecurityRouter'));
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
    route('security/*', SecurityRouter, { name: 'Security', icon: Icon.ShieldCheckIcon }),

    /**
     * Account - Legacy Redirects
     *
     * These pages became tabs under Security. Unnamed so they stay out of the sidebar, they
     * exist only so existing bookmarks don't land on a 404.
     */
    route('api', redirectTo('/account/security/api')),
    route('ssh', redirectTo('/account/security/ssh')),
    route('passkeys', redirectTo('/account/security/passkeys')),

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
