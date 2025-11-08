export type OrderStatus = 'pending' | 'expired' | 'failed' | 'processed';
export type OrderType = 'new' | 'upg' | 'ren';

export interface OrderFilters {
    id?: number;
    name?: string;
}

export interface UpdateStripeIntent {
    id: number;
    node_id?: number;
    intent: string;
    vars?: { key: string; value: string }[];
    serverId?: number;
    renewal?: boolean;
}
