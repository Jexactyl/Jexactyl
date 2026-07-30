import Pill, { PillStatus } from '@/elements/Pill';
import PageContentBlock from '@/elements/PageContentBlock';
import { useContext, useEffect, useState } from 'react';
import useFlash from '@/plugins/useFlash';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    useTableHooks,
} from '@/elements/AdminTable';
import CopyOnClick from '@/elements/CopyOnClick';
import { formatDistanceToNowStrict } from 'date-fns';
import { getAllOrders, useGetOrders } from '@/api/routes/account/billing/orders';
import { Context as OrderContext } from '@/api/routes/account/billing/orders/index';
import { OrderFilters } from '@/api/routes/account/billing/orders/types';
import { Order } from '@definitions/account/billing';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faClockRotateLeft,
    faReceipt,
    faServer,
    faWallet,
    faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import StatTile from '@/elements/billing/StatTile';
import Money from '@/elements/billing/Money';
import InvoiceIcon from './InvoiceIcon';

export function type(state: string): PillStatus {
    switch (state) {
        case 'processed':
            return 'success';
        case 'failed':
            return 'danger';
        case 'pending':
            return 'warn';
        default:
            return 'unknown';
    }
}

function OrderTable({ server_id }: { server_id?: number }) {
    const { data: orders, error } = useGetOrders();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(OrderContext);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ name: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        clearFlashes();

        if (error) {
            clearAndAddHttpError({ key: 'billing:orders', error });
        }
    }, [error]);

    useEffect(() => {
        if (server_id) {
            setFilters({ server_id });
        }
    }, []);

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={orders} onPageSelect={setPage}>
                    <div className={`overflow-x-auto`}>
                        <table className={`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'ID'}
                                    direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('id')}
                                />
                                <TableHeader
                                    name={'Total Price'}
                                    direction={sort === 'total' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('total')}
                                />
                                <TableHeader name={'Description'} />
                                <TableHeader
                                    name={'Created At'}
                                    direction={sort === 'created_at' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('created_at')}
                                />
                                <TableHeader name={'Payment State'} />
                                <TableHeader
                                    name={'Order Type'}
                                    direction={sort === 'type' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('type')}
                                />
                                {!server_id && <TableHeader name={'Active Service'} />}
                                <TableHeader name={'Invoice'} />
                            </TableHead>
                            <TableBody>
                                {orders !== undefined &&
                                    orders.items.length > 0 &&
                                    orders.items.map(order => (
                                        <TableRow key={order.id}>
                                            <td className={`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={order.id}>
                                                    <code className={`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {order.id}
                                                    </code>
                                                </CopyOnClick>
                                            </td>
                                            <td className={'px-6 py-4 text-white font-bold'}>
                                                <Money value={order.total} suffix={'/mo'} />
                                            </td>
                                            <td className={'px-6 py-4'}>{order.description}</td>
                                            <td className={'px-6 py-4'}>
                                                {formatDistanceToNowStrict(order.created_at, { addSuffix: true })}
                                            </td>
                                            <td className={'px-6 py-4 text-left'}>
                                                <Pill size={'small'} type={type(order.status)}>
                                                    {order.status}
                                                </Pill>
                                            </td>
                                            <td className={'pr-12 py-4 text-center'}>
                                                <Pill size={'small'} type={order.type === 'new' ? 'success' : 'info'}>
                                                    {order.type.toUpperCase()}
                                                </Pill>
                                            </td>
                                            {!server_id && (
                                                <td className={'px-6 py-4 text-left ml-4'}>
                                                    {order.server_id ? (
                                                        <FontAwesomeIcon
                                                            icon={faCheckCircle}
                                                            className={'text-green-400'}
                                                        />
                                                    ) : (
                                                        <FontAwesomeIcon
                                                            icon={faXmarkCircle}
                                                            className={'text-red-400'}
                                                        />
                                                    )}
                                                </td>
                                            )}
                                            <td className={'px-6 py-4 text-center'}>
                                                <InvoiceIcon order={order} />
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>
                        {orders === undefined ? <Loading /> : orders.items.length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
}

function BillingStats() {
    const [orders, setOrders] = useState<Order[] | undefined>();

    useEffect(() => {
        getAllOrders()
            .then(setOrders)
            .catch(error => console.error(error));
    }, []);

    const activeServerIds = new Set<number>();
    let monthlyRecurring = 0;
    let lifetimeSpend = 0;
    let pending = 0;

    (orders || []).forEach(order => {
        if (order.status === 'pending') pending++;
        if (order.status === 'processed') lifetimeSpend += order.total;

        if (order.server_id && order.relationships.server && !activeServerIds.has(order.server_id)) {
            activeServerIds.add(order.server_id);
            monthlyRecurring += order.total;
        }
    });

    return (
        <div className={'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'}>
            <StatTile
                icon={faServer}
                label={'Active Services'}
                value={orders === undefined ? '...' : activeServerIds.size}
            />
            <StatTile
                icon={faWallet}
                label={'Monthly Recurring'}
                value={orders === undefined ? '...' : <Money value={monthlyRecurring} />}
            />
            <StatTile
                icon={faReceipt}
                label={'Lifetime Spend'}
                value={orders === undefined ? '...' : <Money value={lifetimeSpend} />}
            />
            <StatTile
                icon={faClockRotateLeft}
                label={'Pending Orders'}
                value={orders === undefined ? '...' : pending}
            />
        </div>
    );
}

export default ({ server_id }: { server_id?: number }) => {
    const hooks = useTableHooks<OrderFilters>();

    return !server_id ? (
        <PageContentBlock
            title={'Billing Activity'}
            header
            description={"View and manage the active and previous subscriptions you've created."}
            showFlashKey={'billing:orders'}
        >
            <BillingStats />
            <OrderContext.Provider value={hooks}>
                <OrderTable />
            </OrderContext.Provider>
        </PageContentBlock>
    ) : (
        <OrderContext.Provider value={hooks}>
            <OrderTable server_id={server_id} />
        </OrderContext.Provider>
    );
};
