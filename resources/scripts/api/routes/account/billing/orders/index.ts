import http from '@/api/http';
import { Order, Transformers } from '@definitions/account/billing';
import { createPaginatedHook, createContext } from '@/api';
import { type OrderFilters } from '@/api/routes/account/billing/orders/types';

export const Context = createContext<OrderFilters>();

export const useGetOrders = createPaginatedHook<Order, OrderFilters>({
    url: '/api/client/billing/orders',
    swrKey: 'orders',
    includes: ['server', 'invoice'],
    context: Context,
    transformer: Transformers.toOrder,
});

/**
 * Fetches up to the maximum page size of orders for the current user in one request,
 * used to compute account-wide billing stats client-side rather than paging through
 * the full order history.
 */
export const getAllOrders = (): Promise<Order[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/billing/orders', { params: { include: 'server,invoice', per_page: 100 } })
            .then(({ data }) => resolve((data.data || []).map(Transformers.toOrder)))
            .catch(reject);
    });
};

const downloadBlob = (data: BlobPart, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(url);
};

/**
 * Downloads the generated PDF invoice for an order.
 */
export const downloadInvoice = (orderId: number, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/orders/${orderId}/invoice`, { responseType: 'blob' })
            .then(({ data }) => {
                downloadBlob(data, filename);
                resolve();
            })
            .catch(reject);
    });
};
