import http, { FractalResponseData } from '@/api/http';

export type BillingPlanState = 'paid' | 'due' | 'processing' | 'arrears' | 'terminated' | 'cancelled';

export interface BillingPlan {
    id: string;
    state: BillingPlanState;
    billDate: number;
    uuid: string;
    name: string;
    price: number;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };

    createdAt: Date;
    updatedAt?: Date | null;
}

export const rawDataToPlan = ({ attributes: data }: FractalResponseData): BillingPlan => ({
    id: data.id,
    state: data.state,
    billDate: data.bill_date,
    uuid: data.uuid,
    name: data.name,
    price: data.price,
    description: data.description,

    limits: {
        cpu: data.limits.cpu,
        memory: data.limits.memory,
        disk: data.limits.disk,
        backup: data.limits.backup,
        database: data.limits.database,
        allocation: data.limits.allocation,
    },

    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
});

const getBillingPlans = (): Promise<BillingPlan[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/plans`)
            .then(({ data }) => resolve((data.data || []).map((datum: any) => rawDataToPlan(datum))))
            .catch(reject);
    });
};

const getBillingPlan = (id: number): Promise<BillingPlan> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/plans/${id}`)
            .then(({ data }) => resolve(rawDataToPlan(data)))
            .catch(reject);
    });
};

export { getBillingPlan, getBillingPlans };
