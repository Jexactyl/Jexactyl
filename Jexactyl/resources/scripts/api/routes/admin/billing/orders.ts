import { Order, Transformers } from '@definitions/admin';
import { OrderFilters } from './types';
import { createPaginatedHook, createContext } from '@/api';

export const Context = createContext<OrderFilters>();

export const useGetOrders = createPaginatedHook<Order, OrderFilters>({
    url: '/api/application/billing/orders',
    swrKey: 'orders',
    context: Context,
    transformer: Transformers.toOrder,
});
