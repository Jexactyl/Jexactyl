import http from '@/api/http';
import { BillingException, Transformers } from '@definitions/admin';
import { BillingExceptionFilters } from '@/api/routes/admin/billing/types';
import { createContext, createPaginatedHook } from '@/api';

export const Context = createContext<BillingExceptionFilters>();

export const useGetBillingExceptions = createPaginatedHook<BillingException, BillingExceptionFilters>({
    url: '/api/application/billing/exceptions',
    swrKey: 'exceptions',
    context: Context,
    transformer: Transformers.toBillingException,
});

export const resolveBillingException = (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/exceptions/${uuid}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const resolveAllBillingExceptions = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/exceptions`)
            .then(() => resolve())
            .catch(reject);
    });
};
