import http from '@/api/http';
import { Order, Transformers } from '@definitions/account/billing';
import { createPaginatedHook, createContext } from '@/api';
import { type OrderFilters } from '@/api/routes/account/billing/orders/types';

export const Context = createContext<OrderFilters>();

export const useGetOrders = createPaginatedHook<Order, OrderFilters>({
    url: '/api/client/billing/orders',
    swrKey: 'orders',
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
