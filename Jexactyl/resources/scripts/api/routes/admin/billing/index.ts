import { BillingAnalytics } from '@definitions/admin';
import http from '@/api/http';

export const getBillingAnalytics = (): Promise<BillingAnalytics> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/analytics`)
            .then(({ data }) => resolve(data || []))
            .catch(reject);
    });
};

export const deleteStripeKeys = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/keys`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateSettings = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/billing/settings`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};
