import http from '@/api/http';
import { Order, Transformers } from '@definitions/account/billing';
import { createPaginatedHook, createContext } from '@/api';
import { type OrderFilters } from '@/api/routes/account/billing/orders/types';

export const Context = createContext<OrderFilters>();

export const useGetOrders = createPaginatedHook<Order, OrderFilters>({
    url: '/api/client/billing/orders',
    swrKey: 'orders',
    includes: ['server'],
    context: Context,
    transformer: Transformers.toOrder,
});

export const getOrder = (id: number): Promise<Order> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/orders/${id}`)
            .then(({ data }) => resolve(Transformers.toOrder(data)))
            .catch(reject);
    });
};

/**
 * Fetches up to the maximum page size of orders for the current user in one request,
 * used to compute account-wide billing stats client-side rather than paging through
 * the full order history.
 */
export const getAllOrders = (): Promise<Order[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/billing/orders', { params: { include: 'server', per_page: 100 } })
            .then(({ data }) => resolve((data.data || []).map(Transformers.toOrder)))
            .catch(reject);
    });
};
