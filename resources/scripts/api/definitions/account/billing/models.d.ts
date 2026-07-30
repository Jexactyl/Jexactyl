import { Model } from '@definitions';
import { OrderType } from '@/api/routes/account/billing/orders/types';
import { Server } from '../../server';

interface Order extends Model {
    id: number;
    name: string;
    user_id: number;
    description: string;
    total: number;
    product_id: number;
    status: OrderStatus;
    type: OrderType;
    server_id?: number | null;
    metadata: { deployment_fee?: number } | null;
    created_at: Date;

    relationships: {
        server: Server | null;
    };
}

interface DiscountCode extends Model {
    code: string;
    description: string;
    type: 'percentage' | 'numeric';
    value: number;
}

interface Category extends Model {
    id: string;
    name: string;
    icon?: string;
    description?: string;
}

interface Product extends Model {
    id: number;
    name: string;
    icon?: string;
    price: number;
    description?: string;
    eggId: number | null;
    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };
}

interface Node extends Model {
    id: string;
    name: string;
    fqdn: string;
    deployable: boolean;
    deployableFree: boolean;
    deploymentFee: number;
}

interface Egg extends Model {
    id: number;
    uuid: string;
    name: string;
}

interface StripeIntent extends Model {
    id: string;
    secret: string;
}
